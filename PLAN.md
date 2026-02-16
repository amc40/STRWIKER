# Skip Functionality Implementation Plan

## Overview

Wire up the existing dummy skip button to a full backend implementation. Skip allows queued players (not on the table) to be temporarily excluded from rotation. When rotation occurs, skipped players are passed over and sent to the back of the queue with their skip cleared.

Two new boolean flags (`isStriker`, `isDefender`) will be stored on each `PlayerPoint` record to make it easy to query which players were actually on the table for any given point. A configurable enum controls which team has striker at position 0.

---

## 1. Database Schema Changes

**File:** `prisma/schema.prisma`

### 1a. Add role flags to `PlayerPoint`

```prisma
model PlayerPoint {
  ...
  skipped    Boolean @default(false)   // already exists
  isStriker  Boolean @default(false)    // NEW
  isDefender Boolean @default(false)    // NEW
  ...
}
```

### 1b. Add `StrikerPosition` enum and field to `Game`

The striker of one team faces the defender of the other. By default, the blue team has their striker at position 0, facing the red defender at position 0. This is configurable per-game:

```prisma
enum StrikerPosition {
  BlueStrikerAtPositionZero   // default: Blue striker=pos0, Red defender=pos0
  RedStrikerAtPositionZero    // flipped: Red striker=pos0, Blue defender=pos0
}

model Game {
  ...
  strikerPosition StrikerPosition @default(BlueStrikerAtPositionZero)
}
```

**Role assignment logic:**

Given a team and the game's `StrikerPosition` setting:
- **Blue team, `BlueStrikerAtPositionZero`:** first non-skipped player = striker, second = defender
- **Blue team, `RedStrikerAtPositionZero`:** first non-skipped player = defender, second = striker
- **Red team:** the inverse of Blue in each case

Create a Prisma migration for all new columns/enums.

---

## 2. Add `skipped` to the `PlayerInfo` View

**File:** `app/view/PlayerInfo.ts`

Add `skipped: boolean` to the `PlayerInfo` interface and update the `playerPointWithPlayerAndGoalsScoredToPlayerInfo` mapper to include it.

---

## 3. Backend: Toggle Skip Server Action + Service Method

### 3a. GameLogicService — new method `toggleSkipForPlayerInCurrentPoint`

**File:** `app/services/gameLogicService.ts`

- Fetch the player's current `PlayerPoint` for the active point
- **Validation:** if the player is currently NOT skipped and toggling would make ALL players on the team skipped, **throw an error** (the frontend will display this as a toast)
- Toggle the `skipped` field in the DB
- After toggling, recalculate `isStriker` / `isDefender` for all players on that team in that point (see step 5)

### 3b. Server Action — `toggleSkipPlayer`

**File:** `lib/Game.actions.ts`

New exported action:
```ts
export const toggleSkipPlayer = async (
  playerId: number,
  gameStateMutationId: string,
) => { ... }
```

Calls the service method, then broadcasts updated game state via `registerUpdatedGameState`. Errors (e.g. all-skipped) will propagate to the frontend and be shown as a toast via the existing `addErrorMessage` pattern.

---

## 4. Rotation Logic Changes

**Core idea:** When a team rotates, instead of only moving position 0 to the back, move position 0 **plus every consecutively-skipped player after it** to the back. Stop before the first non-skipped player; that player becomes the new position 0.

**The rotation is a 3-step process:**

1. **Calculate** — determine target positions for all players
2. **Update** — write the new positions to the DB
3. **Clear skips** — clear the `skipped` flag on any players that were rotated to the back

### 4a. Step 1: Calculate — new method on `PlayerPointPositionService`

**File:** `app/services/playerPointPositionService.ts`

Add a method like `calculateRotatedPositionsForTeam` that takes the full list of a team's `PlayerPoint` entries (with skip info) and returns a result describing each player's new position and whether their skip should be cleared. The algorithm:

1. Sort players by current position ascending.
2. If the team is NOT rotating, keep all positions the same. Return with no skip clears.
3. If the team IS rotating:
   a. The player at position 0 always rotates to the back (regardless of skip status).
   b. Starting from position 1, check each player: if `skipped`, they also rotate to the back. Continue until a non-skipped player is found.
   c. Let `splitIndex` = the position of the first non-skipped player after position 0.
   d. Players at positions `[splitIndex .. end]` shift forward: `newPosition = oldPosition - splitIndex`.
   e. Players at positions `[0 .. splitIndex-1]` go to the back: `newPosition = (teamSize - splitIndex) + oldPosition`.
4. Return a structure like:
   ```ts
   interface RotationResult {
     positionsByPlayerId: Map<number, number>;
     playerIdsToUnskip: Set<number>;   // players rotated to back whose skip should clear
   }
   ```

**Example:**
- Before: `[A, B(skip), C(skip), D, E]` — splitIndex = 3
- After:  `[D, E, A, B, C]` — playerIdsToUnskip = {B, C}

### 4b. Steps 2 & 3: Update positions then clear skips — in `setupNextPoint`

**File:** `app/services/gameLogicService.ts` (lines 385–433)

Replace the per-player `getNextPlayerPositionForTeamInGame` call with the new method from 4a. The new flow:

1. Fetch all `oldPlayerPoints` from the finished point.
2. Group by team.
3. **Step 1 (Calculate):** For each team, call `calculateRotatedPositionsForTeam` to get the rotation result.
4. **Step 2 (Update positions):** Build `newPlayerPointsToCreate` with:
   - Correct new positions from the rotation result
   - Preserve `skipped` flag as-is from the old player point (don't clear yet)
   - Reset `scoredGoal`, `ownGoal`, `rattled` as before
   - Create the new `PlayerPoint` records in the DB
5. **Step 3 (Clear skips):** For each player in `playerIdsToUnskip`, update their new `PlayerPoint` to set `skipped = false`.
6. Compute and set `isStriker` / `isDefender` flags (see step 5).

### 4c. Update `startGameFromPreviousCompletedGame`

**File:** `app/services/gameLogicService.ts` (lines 161–206)

Use the same 3-step rotate + clear skip logic from 4b. Skip states from the previous game's last point carry over — if a player was skipped, they get rotated to the back and their skip is cleared, just like during a normal point transition.

### 4d. Existing per-player methods

`getNextPlayerPosition` / `getNextPlayerPositionForTeamInGame` / `getNextPlayerPositionForTeamWithRotatyStrategy` can remain for the `startGameFromPreviousAbandonedGame` path (where positions are preserved as-is) and any other non-rotating scenario.

---

## 5. Striker/Defender Flag Computation

**New helper method** (on `GameLogicService` or `PlayerPointPositionService`):

```ts
computeStrikerDefenderFlags(
  teamPlayerPoints: PlayerPoint[],
  team: Team,
  strikerPosition: StrikerPosition,
): Map<number, { isStriker: boolean, isDefender: boolean }>
```

Logic:
1. Sort by position ascending.
2. Find the first non-skipped player and the second non-skipped player.
3. Determine which one is striker vs defender based on the team and the game's `StrikerPosition` enum:
   - If `BlueStrikerAtPositionZero`:
     - **Blue:** first non-skipped = striker, second non-skipped = defender
     - **Red:** first non-skipped = defender, second non-skipped = striker
   - If `RedStrikerAtPositionZero`:
     - **Red:** first non-skipped = striker, second non-skipped = defender
     - **Blue:** first non-skipped = defender, second non-skipped = striker
4. All other players get both flags `false`.

**When to call this:**
- When creating `PlayerPoint` records for a new point (`setupNextPoint`, `startGameFromPrevious*`) — after step 3 (clear skips)
- After toggling skip on a player (step 3a)
- After adding a player (`addPlayerToPoint`)
- After removing a player (`removePlayerFromPoint`)
- After reordering a player (`reorderPlayerInCurrentGame`)

This ensures the flags stay consistent with the current state at all times.

---

## 6. Update Participating Players Logic

**File:** `app/services/gameLogicService.ts` (lines 505–516)

`getParticipatingPlayersInPoint` currently filters by `position <= 1`. Update this to filter by `isStriker || isDefender` instead. This ensures that if position 0 or 1 is a skipped player (during setup, before rotation has happened), they won't be incorrectly counted as participating.

---

## 7. Frontend: Wire Up Skip Button

### 7a. Add `skipPlayer` to `GameStateWithMutations`

**File:** `app/hooks/useGameState.ts`

- Add `skipPlayer: (player: PlayerInfo) => void` to the interface
- Implement with optimistic update (toggle `skipped` in local state) + call the server action
- Add to the `OptimisticPlayerMutationAction` union:
  ```ts
  | { type: 'skipPlayer'; playerId: number }
  ```
- Update `optimisticPlayersReducer` to handle it (toggle `skipped` flag on the matching player)
- On error (e.g. all-skipped validation), revert optimistic state and show toast via `addErrorMessage`

### 7b. Update `PlayerCard` to use game state skip

**File:** `app/components/player-card/PlayerCard.tsx`

- Remove local `useState(false)` for `skipped` (line 55)
- Read `skipped` from `player.skipped` (passed in via `PlayerInfo`)
- Call `gameState.skipPlayer(player)` from the `CircleSkip` `onSkip` handler

### 7c. Add `skipPlayer` to `GameStateContext`

**File:** `app/context/GameStateContext.tsx`

Include `skipPlayer` in the provided context value (it's already part of `GameStateWithMutations` from 7a).

### 7d. Update `GameInfoService` to include `skipped`

**File:** `app/services/gameInfoService.ts`

When building `PlayerInfo` objects, include the `skipped` field from the current `PlayerPoint`.

---

## 8. Edge Cases to Handle

1. **All players on a team would become skipped:** The `toggleSkipForPlayerInCurrentPoint` method throws an error. The frontend catches this and displays a toast via the existing `addErrorMessage` pattern. The optimistic state is reverted.

2. **Teams with ≤ 2 players:** Skip still works, but if there are only 2 players and one is skipped, only one player is "on the table." This is fine.

3. **Skip toggled after point has started:** The skip doesn't affect the current point — it only affects the next rotation. The `isStriker`/`isDefender` flags are still recalculated so stats reflect reality.

4. **Player removed while skipped:** Normal removal logic applies; no special handling needed since the PlayerPoint is deleted.

5. **Drag-and-drop reorder of a skipped player:** Should work normally. Reordering doesn't affect skip status. Striker/defender flags get recalculated after reorder.

6. **New game from previous completed game:** The same 3-step rotate + clear skip logic is used. Skipped players from the last point of the previous game get rotated to the back and un-skipped in the first point of the new game.

---

## Summary of Files Modified

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add `isStriker`, `isDefender` to `PlayerPoint`; add `StrikerPosition` enum and field to `Game` |
| `app/view/PlayerInfo.ts` | Add `skipped` field |
| `app/services/gameLogicService.ts` | New `toggleSkip` method (with all-skipped validation), update `setupNextPoint` with 3-step rotation, update `startGameFromPreviousCompletedGame`, update `getParticipatingPlayersInPoint`, add striker/defender flag computation, call flag recomputation after add/remove |
| `app/services/playerPointPositionService.ts` | New `calculateRotatedPositionsForTeam` method returning positions + playerIdsToUnskip |
| `app/services/gameInfoService.ts` | Include `skipped` in PlayerInfo assembly |
| `lib/Game.actions.ts` | New `toggleSkipPlayer` action |
| `app/hooks/useGameState.ts` | Add `skipPlayer` mutation with optimistic update + error revert |
| `app/components/player-card/PlayerCard.tsx` | Wire skip button to game state instead of local state |
| `app/view/GameState.ts` | No changes needed (players already carry PlayerInfo) |
| `app/repository/playerPointRepository.ts` | Possibly new query helpers for updating striker/defender flags and clearing skips |
