# Skip Functionality Implementation Plan

## Overview

Wire up the existing dummy skip button to a full backend implementation. Skip allows queued players (not on the table) to be temporarily excluded from rotation. When rotation occurs, skipped players are passed over and sent to the back of the queue with their skip cleared.

Two new boolean flags (`isFirstActivePlayer`, `isSecondActivePlayer`) will be stored on each `PlayerPoint` record to make it easy to query which players were actually on the table for any given point.

---

## 1. Database Schema Changes

**File:** `prisma/schema.prisma`

Add two new boolean fields to `PlayerPoint`:

```prisma
model PlayerPoint {
  ...
  skipped              Boolean @default(false)   // already exists
  isFirstActivePlayer  Boolean @default(false)    // NEW
  isSecondActivePlayer Boolean @default(false)    // NEW
  ...
}
```

Create a Prisma migration for the two new columns.

---

## 2. Add `skipped` to the `PlayerInfo` View

**File:** `app/view/PlayerInfo.ts`

Add `skipped: boolean` to the `PlayerInfo` interface and update the `playerPointWithPlayerAndGoalsScoredToPlayerInfo` mapper to include it.

---

## 3. Backend: Toggle Skip Server Action + Service Method

### 3a. GameLogicService — new method `toggleSkipForPlayerInCurrentPoint`

**File:** `app/services/gameLogicService.ts`

- Fetch the player's current `PlayerPoint` for the active point
- Toggle the `skipped` field in the DB
- After toggling, recalculate `isFirstActivePlayer` / `isSecondActivePlayer` for all players on that team in that point (see step 5)

### 3b. Server Action — `toggleSkipPlayer`

**File:** `lib/Game.actions.ts`

New exported action:
```ts
export const toggleSkipPlayer = async (
  playerId: number,
  gameStateMutationId: string,
) => { ... }
```

Calls the service method, then broadcasts updated game state via `registerUpdatedGameState`.

---

## 4. Rotation Logic Changes

**Core idea:** When a team rotates, instead of only moving position 0 to the back, move position 0 **plus every consecutively-skipped player after it** to the back. Stop before the first non-skipped player; that player becomes the new position 0.

### 4a. New method on `PlayerPointPositionService`

**File:** `app/services/playerPointPositionService.ts`

Add a method like `getNextPlayerPositionsForTeam` that takes the full list of a team's `PlayerPoint` entries (with skip info) and returns a map of `playerId → newPosition`. The algorithm:

1. Sort players by current position ascending.
2. If the team is NOT rotating, keep all positions the same.
3. If the team IS rotating:
   a. The player at position 0 always rotates to the back (regardless of skip status).
   b. Starting from position 1, check each player: if `skipped`, they also rotate to the back. Continue until a non-skipped player is found.
   c. Let `splitIndex` = the position of the first non-skipped player after position 0.
   d. Players at positions `[splitIndex .. end]` shift forward: `newPosition = oldPosition - splitIndex`.
   e. Players at positions `[0 .. splitIndex-1]` go to the back: `newPosition = (teamSize - splitIndex) + oldPosition`.
4. For any player whose skip flag was set and who got rotated to the back, clear their `skipped` flag in the new `PlayerPoint`.

**Example:**
- Before: `[A, B(skip), C(skip), D, E]` — splitIndex = 3
- After:  `[D, E, A, B, C]` — B and C have skip cleared

### 4b. Update `setupNextPoint` in `GameLogicService`

**File:** `app/services/gameLogicService.ts` (lines 385–433)

Replace the per-player `getNextPlayerPositionForTeamInGame` call with the new batch method from 4a. The new flow:

1. Fetch all `oldPlayerPoints` from the finished point.
2. Group by team.
3. For each team, call the new batch position calculator (passing skip states).
4. Build `newPlayerPointsToCreate` with:
   - Correct new positions
   - `skipped: false` for players who were rotated to the back (skip cleared); preserve `skipped` for players who stayed in the queue
   - Computed `isFirstActivePlayer` / `isSecondActivePlayer` (see step 5)
   - Reset `scoredGoal`, `ownGoal`, `rattled` as before

### 4c. Update `startGameFromPreviousCompletedGame`

**File:** `app/services/gameLogicService.ts` (lines 161–206)

Same change as 4b — use the new batch method. Skip states from the previous game's last point should carry over into the first point of the new game (so a player who was skipped stays skipped across the game boundary, unless they got rotated to the back). **Alternative:** clear all skips at game start for simplicity — this is a design decision to confirm with the user.

### 4d. Update `getNextPlayerPosition` / `getNextPlayerPositionForTeamInGame`

These existing per-player methods can remain for the non-rotation case and for `startGameFromPreviousAbandonedGame`. The new batch method will be used only when rotation + skip is in play.

---

## 5. Active Player Flag Computation

**New helper method** (on `GameLogicService` or `PlayerPointPositionService`):

```ts
computeActivePlayerFlags(teamPlayerPoints: PlayerPoint[]): Map<number, { isFirst: boolean, isSecond: boolean }>
```

Logic:
1. Sort by position ascending.
2. Filter to non-skipped players.
3. The first non-skipped player gets `isFirstActivePlayer = true`.
4. The second non-skipped player gets `isSecondActivePlayer = true`.
5. All others get both flags `false`.

**When to call this:**
- When creating `PlayerPoint` records for a new point (`setupNextPoint`, `startGameFromPrevious*`)
- After toggling skip on a player (step 3a)
- After adding a player (`addPlayerToPoint`)
- After removing a player (`removePlayerFromPoint`)
- After reordering a player (`reorderPlayerInCurrentGame`)

This ensures the flags stay consistent with the current state at all times.

---

## 6. Update Participating Players Logic

**File:** `app/services/gameLogicService.ts` (lines 505–516)

`getParticipatingPlayersInPoint` currently filters by `position <= 1`. Update this to filter by `isFirstActivePlayer || isSecondActivePlayer` instead. This ensures that if position 0 or 1 is a skipped player (during setup, before rotation has happened), they won't be incorrectly counted as participating. This also future-proofs the logic if the active player threshold ever changes.

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

1. **All players on a team are skipped:** Prevent this — the toggle should be a no-op (or show an error) if it would result in zero non-skipped players on a team. At minimum, there must be one non-skipped player.

2. **Teams with ≤ 2 players:** Skip still works, but if there are only 2 players and one is skipped, only one player is "on the table." This is fine.

3. **Skip toggled after point has started:** The skip doesn't affect the current point — it only affects the next rotation. The `isFirstActivePlayer`/`isSecondActivePlayer` flags should still be recalculated so stats reflect reality.

4. **Player removed while skipped:** Normal removal logic applies; no special handling needed since the PlayerPoint is deleted.

5. **Drag-and-drop reorder of a skipped player:** Should work normally. Reordering doesn't affect skip status. Active player flags get recalculated after reorder.

---

## Summary of Files Modified

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add `isFirstActivePlayer`, `isSecondActivePlayer` to `PlayerPoint` |
| `app/view/PlayerInfo.ts` | Add `skipped` field |
| `app/services/gameLogicService.ts` | New `toggleSkip` method, update `setupNextPoint`, update `getParticipatingPlayersInPoint`, add active flag computation, call flag recomputation after add/remove |
| `app/services/playerPointPositionService.ts` | New batch position calculator with skip-aware rotation |
| `app/services/gameInfoService.ts` | Include `skipped` in PlayerInfo assembly |
| `lib/Game.actions.ts` | New `toggleSkipPlayer` action |
| `app/hooks/useGameState.ts` | Add `skipPlayer` mutation with optimistic update |
| `app/components/player-card/PlayerCard.tsx` | Wire skip button to game state instead of local state |
| `app/view/GameState.ts` | No changes needed (players already carry PlayerInfo) |
| `app/repository/playerPointRepository.ts` | Possibly new query helpers for updating active flags |
