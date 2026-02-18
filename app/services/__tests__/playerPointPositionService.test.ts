import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerPoint, Team, StrikerPosition } from '@prisma/client';
import {
  PlayerPointPositionService,
  RotationResult,
} from '../playerPointPositionService';

/**
 * Helper to create a PlayerPoint with sensible defaults.
 * Only playerId, position, and optionally skipped/team need to vary per test.
 */
function makePlayerPoint(
  overrides: Partial<PlayerPoint> & { playerId: number; position: number },
): PlayerPoint {
  return {
    id: overrides.id ?? overrides.playerId * 100 + overrides.position,
    playerId: overrides.playerId,
    pointId: overrides.pointId ?? 1,
    position: overrides.position,
    team: overrides.team ?? 'Red',
    skipped: overrides.skipped ?? false,
    scoredGoal: overrides.scoredGoal ?? false,
    ownGoal: overrides.ownGoal ?? false,
    rattled: overrides.rattled ?? false,
    isStriker: overrides.isStriker ?? false,
    isDefender: overrides.isDefender ?? false,
  };
}

/** Convenience to extract the position map as a plain object for easier assertions. */
function positionsToObject(result: RotationResult): Record<number, number> {
  const obj: Record<number, number> = {};
  result.positionsByPlayerId.forEach((pos, id) => {
    obj[id] = pos;
  });
  return obj;
}

describe('PlayerPointPositionService', () => {
  let service: PlayerPointPositionService;

  beforeEach(() => {
    service = new PlayerPointPositionService();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // calculateRotatedPositionsForTeam
  // ─────────────────────────────────────────────────────────────────────────
  describe('calculateRotatedPositionsForTeam', () => {
    // ── No rotation ──────────────────────────────────────────────────────
    describe('when not rotating', () => {
      it('returns the same positions for all players', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1 }),
          makePlayerPoint({ playerId: 3, position: 2 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, false);
        expect(positionsToObject(result)).toEqual({ 1: 0, 2: 1, 3: 2 });
        expect(result.playerIdsToUnskip.size).toBe(0);
      });

      it('preserves positions even when some players are skipped', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1, skipped: true }),
          makePlayerPoint({ playerId: 3, position: 2 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, false);
        expect(positionsToObject(result)).toEqual({ 1: 0, 2: 1, 3: 2 });
        expect(result.playerIdsToUnskip.size).toBe(0);
      });
    });

    // ── Empty team ───────────────────────────────────────────────────────
    describe('with empty team', () => {
      it('returns empty maps', () => {
        const result = service.calculateRotatedPositionsForTeam([], true);
        expect(result.positionsByPlayerId.size).toBe(0);
        expect(result.playerIdsToUnskip.size).toBe(0);
      });
    });

    // ── Single player ────────────────────────────────────────────────────
    describe('with a single player', () => {
      it('keeps the player at position 0', () => {
        const pps = [makePlayerPoint({ playerId: 1, position: 0 })];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        expect(positionsToObject(result)).toEqual({ 1: 0 });
        expect(result.playerIdsToUnskip.size).toBe(0);
      });
    });

    // ── Normal rotation (no skips) ───────────────────────────────────────
    describe('normal rotation with no skipped players', () => {
      it('rotates 2 players: position 0 goes to back, position 1 moves forward', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        expect(positionsToObject(result)).toEqual({ 1: 1, 2: 0 });
        expect(result.playerIdsToUnskip.size).toBe(0);
      });

      it('rotates 3 players correctly', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1 }),
          makePlayerPoint({ playerId: 3, position: 2 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // Player 1 (pos 0) -> back (pos 2)
        // Player 2 (pos 1) -> pos 0
        // Player 3 (pos 2) -> pos 1
        expect(positionsToObject(result)).toEqual({ 1: 2, 2: 0, 3: 1 });
        expect(result.playerIdsToUnskip.size).toBe(0);
      });

      it('rotates 5 players correctly', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1 }),
          makePlayerPoint({ playerId: 3, position: 2 }),
          makePlayerPoint({ playerId: 4, position: 3 }),
          makePlayerPoint({ playerId: 5, position: 4 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        expect(positionsToObject(result)).toEqual({
          1: 4,
          2: 0,
          3: 1,
          4: 2,
          5: 3,
        });
      });

      it('handles unsorted input correctly', () => {
        const pps = [
          makePlayerPoint({ playerId: 3, position: 2 }),
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        expect(positionsToObject(result)).toEqual({ 1: 2, 2: 0, 3: 1 });
      });
    });

    // ── Rotation with one skipped player at position 1 ───────────────────
    describe('rotation with one skipped player at position 1 (consecutive from front)', () => {
      it('rotates both position 0 and skipped position 1 to the back together', () => {
        // Players: [0: active, 1: skipped, 2: active, 3: active]
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1, skipped: true }),
          makePlayerPoint({ playerId: 3, position: 2 }),
          makePlayerPoint({ playerId: 4, position: 3 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // splitIndex = 2 (position 0 + skipped position 1)
        // Player 1 (pos 0, i=0): newPos = 4 - 2 + 0 = 2
        // Player 2 (pos 1, i=1, skipped): newPos = 4 - 2 + 1 = 3, unskipped
        // Player 3 (pos 2, i=2): newPos = 2 - 2 = 0
        // Player 4 (pos 3, i=3): newPos = 3 - 2 = 1
        expect(positionsToObject(result)).toEqual({
          1: 2,
          2: 3,
          3: 0,
          4: 1,
        });
        expect([...result.playerIdsToUnskip]).toEqual([2]);
      });
    });

    // ── Rotation with consecutive skipped players from position 1 ────────
    describe('rotation with multiple consecutive skipped players from position 1', () => {
      it('rotates position 0 and all consecutive skipped players to the back', () => {
        // Players: [0: active, 1: skipped, 2: skipped, 3: active, 4: active]
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1, skipped: true }),
          makePlayerPoint({ playerId: 3, position: 2, skipped: true }),
          makePlayerPoint({ playerId: 4, position: 3 }),
          makePlayerPoint({ playerId: 5, position: 4 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // splitIndex = 3 (position 0 + skipped positions 1 and 2)
        // Player 1 (i=0): newPos = 5 - 3 + 0 = 2
        // Player 2 (i=1, skipped): newPos = 5 - 3 + 1 = 3, unskipped
        // Player 3 (i=2, skipped): newPos = 5 - 3 + 2 = 4, unskipped
        // Player 4 (i=3): newPos = 3 - 3 = 0
        // Player 5 (i=4): newPos = 4 - 3 = 1
        expect(positionsToObject(result)).toEqual({
          1: 2,
          2: 3,
          3: 4,
          4: 0,
          5: 1,
        });
        expect(new Set(result.playerIdsToUnskip)).toEqual(new Set([2, 3]));
      });
    });

    // ── Skipped player not consecutive from position 1 ───────────────────
    describe('rotation with skipped player NOT at position 1', () => {
      it('does not include non-consecutive skipped players in the rotation group', () => {
        // Players: [0: active, 1: active, 2: skipped, 3: active]
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1 }),
          makePlayerPoint({ playerId: 3, position: 2, skipped: true }),
          makePlayerPoint({ playerId: 4, position: 3 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // splitIndex = 1 (only position 0 — position 1 is not skipped, breaks the chain)
        // Normal single rotation:
        // Player 1 (i=0): newPos = 4 - 1 + 0 = 3
        // Player 2 (i=1): newPos = 1 - 1 = 0
        // Player 3 (i=2): newPos = 2 - 1 = 1
        // Player 4 (i=3): newPos = 3 - 1 = 2
        expect(positionsToObject(result)).toEqual({
          1: 3,
          2: 0,
          3: 1,
          4: 2,
        });
        expect(result.playerIdsToUnskip.size).toBe(0);
      });
    });

    // ── Skipped player at position 1 but gap after ───────────────────────
    describe('rotation with skipped at position 1 then non-skipped at position 2', () => {
      it('only rotates position 0 and position 1 (the consecutive skipped block)', () => {
        // Players: [0: active, 1: skipped, 2: active, 3: skipped, 4: active]
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1, skipped: true }),
          makePlayerPoint({ playerId: 3, position: 2 }),
          makePlayerPoint({ playerId: 4, position: 3, skipped: true }),
          makePlayerPoint({ playerId: 5, position: 4 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // splitIndex = 2 (position 0 + skipped position 1; position 2 is not skipped)
        // Player 1 (i=0): newPos = 5 - 2 + 0 = 3
        // Player 2 (i=1, skipped): newPos = 5 - 2 + 1 = 4, unskipped
        // Player 3 (i=2): newPos = 2 - 2 = 0
        // Player 4 (i=3): newPos = 3 - 2 = 1
        // Player 5 (i=4): newPos = 4 - 2 = 2
        expect(positionsToObject(result)).toEqual({
          1: 3,
          2: 4,
          3: 0,
          4: 1,
          5: 2,
        });
        expect([...result.playerIdsToUnskip]).toEqual([2]);
      });
    });

    // ── All players except position 0 are skipped ────────────────────────
    describe('all players except position 0 are skipped', () => {
      it('falls back to normal single rotation (splitIndex reset to 1)', () => {
        // Players: [0: active, 1: skipped, 2: skipped, 3: skipped]
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1, skipped: true }),
          makePlayerPoint({ playerId: 3, position: 2, skipped: true }),
          makePlayerPoint({ playerId: 4, position: 3, skipped: true }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // splitIndex walks to 4 (teamSize), then resets to 1
        // Player 1 (i=0): newPos = 4 - 1 + 0 = 3
        // Player 2 (i=1): newPos = 1 - 1 = 0
        // Player 3 (i=2): newPos = 2 - 1 = 1
        // Player 4 (i=3): newPos = 3 - 1 = 2
        expect(positionsToObject(result)).toEqual({
          1: 3,
          2: 0,
          3: 1,
          4: 2,
        });
        // No unskipping happens because the skipped players are in the "shifted forward" group
        expect(result.playerIdsToUnskip.size).toBe(0);
      });

      it('works with 2 players where position 1 is skipped', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1, skipped: true }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // splitIndex walks to 2 (teamSize), resets to 1
        // Player 1 (i=0): newPos = 2 - 1 + 0 = 1
        // Player 2 (i=1): newPos = 1 - 1 = 0
        expect(positionsToObject(result)).toEqual({ 1: 1, 2: 0 });
        expect(result.playerIdsToUnskip.size).toBe(0);
      });
    });

    // ── Position 0 is skipped ────────────────────────────────────────────
    describe('position 0 player is skipped', () => {
      it('rotates position 0 to back and unskips it', () => {
        // Players: [0: skipped, 1: active, 2: active]
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0, skipped: true }),
          makePlayerPoint({ playerId: 2, position: 1 }),
          makePlayerPoint({ playerId: 3, position: 2 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // splitIndex = 1 (position 1 is not skipped)
        // Player 1 (i=0, skipped): newPos = 3 - 1 + 0 = 2, unskipped
        // Player 2 (i=1): newPos = 1 - 1 = 0
        // Player 3 (i=2): newPos = 2 - 1 = 1
        expect(positionsToObject(result)).toEqual({ 1: 2, 2: 0, 3: 1 });
        expect([...result.playerIdsToUnskip]).toEqual([1]);
      });
    });

    // ── Position 0 is skipped and position 1 is also skipped ─────────────
    describe('position 0 and position 1 are both skipped', () => {
      it('rotates both to back and unskips both', () => {
        // Players: [0: skipped, 1: skipped, 2: active, 3: active]
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0, skipped: true }),
          makePlayerPoint({ playerId: 2, position: 1, skipped: true }),
          makePlayerPoint({ playerId: 3, position: 2 }),
          makePlayerPoint({ playerId: 4, position: 3 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // splitIndex = 2 (positions 0 and 1 are skipped, position 2 is not)
        // Player 1 (i=0, skipped): newPos = 4 - 2 + 0 = 2, unskipped
        // Player 2 (i=1, skipped): newPos = 4 - 2 + 1 = 3, unskipped
        // Player 3 (i=2): newPos = 2 - 2 = 0
        // Player 4 (i=3): newPos = 3 - 2 = 1
        expect(positionsToObject(result)).toEqual({
          1: 2,
          2: 3,
          3: 0,
          4: 1,
        });
        expect(new Set(result.playerIdsToUnskip)).toEqual(new Set([1, 2]));
      });
    });

    // ── All players are skipped ──────────────────────────────────────────
    describe('all players are skipped', () => {
      it('falls back to normal single rotation, no unskipping', () => {
        // Players: [0: skipped, 1: skipped, 2: skipped]
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0, skipped: true }),
          makePlayerPoint({ playerId: 2, position: 1, skipped: true }),
          makePlayerPoint({ playerId: 3, position: 2, skipped: true }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // splitIndex walks to 3 (teamSize), resets to 1
        // Player 1 (i=0, skipped): newPos = 3 - 1 + 0 = 2
        // but position 0 IS skipped, so it goes in the rotated group with i < splitIndex
        // Actually splitIndex = 1, so only i=0 is in rotated group
        // Player 1 (i=0): newPos = 3 - 1 + 0 = 2, skipped -> unskipped? No...
        // Wait: the code checks pp.skipped in the i < splitIndex block.
        // Player 1 IS skipped, so it gets added to playerIdsToUnskip
        expect(positionsToObject(result)).toEqual({ 1: 2, 2: 0, 3: 1 });
        expect([...result.playerIdsToUnskip]).toEqual([1]);
      });
    });

    // ── Large team with mixed skips ──────────────────────────────────────
    describe('large team with mixed skips', () => {
      it('handles 6 players with skips at positions 1 and 2', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1, skipped: true }),
          makePlayerPoint({ playerId: 3, position: 2, skipped: true }),
          makePlayerPoint({ playerId: 4, position: 3 }),
          makePlayerPoint({ playerId: 5, position: 4 }),
          makePlayerPoint({ playerId: 6, position: 5 }),
        ];
        const result = service.calculateRotatedPositionsForTeam(pps, true);
        // splitIndex = 3
        // Rotated group (i < 3): players 1,2,3 -> positions 3,4,5
        // Shifted group (i >= 3): players 4,5,6 -> positions 0,1,2
        expect(positionsToObject(result)).toEqual({
          1: 3,
          2: 4,
          3: 5,
          4: 0,
          5: 1,
          6: 2,
        });
        expect(new Set(result.playerIdsToUnskip)).toEqual(new Set([2, 3]));
      });
    });

    // ── Consecutive rotation calls ───────────────────────────────────────
    describe('simulating multiple consecutive rotations', () => {
      it('rotating twice returns correct positions', () => {
        // Initial: [0: P1, 1: P2, 2: P3]
        const pps1 = [
          makePlayerPoint({ playerId: 1, position: 0 }),
          makePlayerPoint({ playerId: 2, position: 1 }),
          makePlayerPoint({ playerId: 3, position: 2 }),
        ];
        const result1 = service.calculateRotatedPositionsForTeam(pps1, true);
        // After first rotation: P2=0, P3=1, P1=2
        expect(positionsToObject(result1)).toEqual({ 1: 2, 2: 0, 3: 1 });

        // Simulate second rotation using result from first
        const pps2 = [
          makePlayerPoint({ playerId: 2, position: 0 }),
          makePlayerPoint({ playerId: 3, position: 1 }),
          makePlayerPoint({ playerId: 1, position: 2 }),
        ];
        const result2 = service.calculateRotatedPositionsForTeam(pps2, true);
        // After second rotation: P3=0, P1=1, P2=2
        expect(positionsToObject(result2)).toEqual({ 2: 2, 3: 0, 1: 1 });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // calculateRotatedPositionsForTeamWithRotatyStrategy
  // ─────────────────────────────────────────────────────────────────────────
  describe('calculateRotatedPositionsForTeamWithRotatyStrategy', () => {
    const pps = [
      makePlayerPoint({ playerId: 1, position: 0 }),
      makePlayerPoint({ playerId: 2, position: 1 }),
      makePlayerPoint({ playerId: 3, position: 2 }),
    ];

    it('rotates when strategy is Always', () => {
      const result = service.calculateRotatedPositionsForTeamWithRotatyStrategy(
        pps,
        'Red',
        'Blue',
        'Always',
      );
      expect(positionsToObject(result)).toEqual({ 1: 2, 2: 0, 3: 1 });
    });

    it('does not rotate when strategy is Never', () => {
      const result = service.calculateRotatedPositionsForTeamWithRotatyStrategy(
        pps,
        'Red',
        'Blue',
        'Never',
      );
      expect(positionsToObject(result)).toEqual({ 1: 0, 2: 1, 3: 2 });
    });

    it('rotates when strategy is OnConcede and team conceded', () => {
      const result = service.calculateRotatedPositionsForTeamWithRotatyStrategy(
        pps,
        'Red',
        'Blue', // Blue scored, so Red conceded
        'OnConcede',
      );
      expect(positionsToObject(result)).toEqual({ 1: 2, 2: 0, 3: 1 });
    });

    it('does not rotate when strategy is OnConcede and team scored', () => {
      const result = service.calculateRotatedPositionsForTeamWithRotatyStrategy(
        pps,
        'Red',
        'Red', // Red scored, so Red did not concede
        'OnConcede',
      );
      expect(positionsToObject(result)).toEqual({ 1: 0, 2: 1, 3: 2 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // computeStrikerDefenderFlags
  // ─────────────────────────────────────────────────────────────────────────
  describe('computeStrikerDefenderFlags', () => {
    // ── Basic assignment with no skipped players ─────────────────────────
    describe('no skipped players', () => {
      it('assigns striker to position 0 and defender to position 1 when BlueStrikerAtPositionZero for Blue team', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0, team: 'Blue' }),
          makePlayerPoint({ playerId: 2, position: 1, team: 'Blue' }),
          makePlayerPoint({ playerId: 3, position: 2, team: 'Blue' }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Blue',
          'BlueStrikerAtPositionZero',
        );
        expect(flags.get(1)).toEqual({ isStriker: true, isDefender: false });
        expect(flags.get(2)).toEqual({ isStriker: false, isDefender: true });
        expect(flags.get(3)).toEqual({ isStriker: false, isDefender: false });
      });

      it('assigns defender to position 0 and striker to position 1 when RedStrikerAtPositionZero for Blue team', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0, team: 'Blue' }),
          makePlayerPoint({ playerId: 2, position: 1, team: 'Blue' }),
          makePlayerPoint({ playerId: 3, position: 2, team: 'Blue' }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Blue',
          'RedStrikerAtPositionZero',
        );
        expect(flags.get(1)).toEqual({ isStriker: false, isDefender: true });
        expect(flags.get(2)).toEqual({ isStriker: true, isDefender: false });
        expect(flags.get(3)).toEqual({ isStriker: false, isDefender: false });
      });

      it('assigns striker to position 0 for Red team when RedStrikerAtPositionZero', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0, team: 'Red' }),
          makePlayerPoint({ playerId: 2, position: 1, team: 'Red' }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Red',
          'RedStrikerAtPositionZero',
        );
        expect(flags.get(1)).toEqual({ isStriker: true, isDefender: false });
        expect(flags.get(2)).toEqual({ isStriker: false, isDefender: true });
      });

      it('assigns defender to position 0 for Red team when BlueStrikerAtPositionZero', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0, team: 'Red' }),
          makePlayerPoint({ playerId: 2, position: 1, team: 'Red' }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Red',
          'BlueStrikerAtPositionZero',
        );
        expect(flags.get(1)).toEqual({ isStriker: false, isDefender: true });
        expect(flags.get(2)).toEqual({ isStriker: true, isDefender: false });
      });
    });

    // ── Single player ────────────────────────────────────────────────────
    describe('single player on team', () => {
      it('assigns only striker if firstIsStriker', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0, team: 'Red' }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Red',
          'RedStrikerAtPositionZero',
        );
        expect(flags.get(1)).toEqual({ isStriker: true, isDefender: false });
      });

      it('assigns only defender if not firstIsStriker', () => {
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0, team: 'Red' }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Red',
          'BlueStrikerAtPositionZero',
        );
        expect(flags.get(1)).toEqual({ isStriker: false, isDefender: true });
      });
    });

    // ── Skipped players ──────────────────────────────────────────────────
    describe('with skipped players', () => {
      it('skips over skipped player at position 0 and assigns flags to first non-skipped', () => {
        const pps = [
          makePlayerPoint({
            playerId: 1,
            position: 0,
            team: 'Blue',
            skipped: true,
          }),
          makePlayerPoint({ playerId: 2, position: 1, team: 'Blue' }),
          makePlayerPoint({ playerId: 3, position: 2, team: 'Blue' }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Blue',
          'BlueStrikerAtPositionZero',
        );
        expect(flags.get(1)).toEqual({ isStriker: false, isDefender: false });
        expect(flags.get(2)).toEqual({ isStriker: true, isDefender: false });
        expect(flags.get(3)).toEqual({ isStriker: false, isDefender: true });
      });

      it('skips over multiple skipped players at the front', () => {
        const pps = [
          makePlayerPoint({
            playerId: 1,
            position: 0,
            team: 'Red',
            skipped: true,
          }),
          makePlayerPoint({
            playerId: 2,
            position: 1,
            team: 'Red',
            skipped: true,
          }),
          makePlayerPoint({ playerId: 3, position: 2, team: 'Red' }),
          makePlayerPoint({ playerId: 4, position: 3, team: 'Red' }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Red',
          'RedStrikerAtPositionZero',
        );
        expect(flags.get(1)).toEqual({ isStriker: false, isDefender: false });
        expect(flags.get(2)).toEqual({ isStriker: false, isDefender: false });
        expect(flags.get(3)).toEqual({ isStriker: true, isDefender: false });
        expect(flags.get(4)).toEqual({ isStriker: false, isDefender: true });
      });

      it('assigns flags around a skipped player in the middle', () => {
        // Positions: [0: active, 1: skipped, 2: active, 3: active]
        const pps = [
          makePlayerPoint({ playerId: 1, position: 0, team: 'Blue' }),
          makePlayerPoint({
            playerId: 2,
            position: 1,
            team: 'Blue',
            skipped: true,
          }),
          makePlayerPoint({ playerId: 3, position: 2, team: 'Blue' }),
          makePlayerPoint({ playerId: 4, position: 3, team: 'Blue' }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Blue',
          'BlueStrikerAtPositionZero',
        );
        // First non-skipped = player 1 (pos 0) -> striker
        // Second non-skipped = player 3 (pos 2) -> defender
        expect(flags.get(1)).toEqual({ isStriker: true, isDefender: false });
        expect(flags.get(2)).toEqual({ isStriker: false, isDefender: false });
        expect(flags.get(3)).toEqual({ isStriker: false, isDefender: true });
        expect(flags.get(4)).toEqual({ isStriker: false, isDefender: false });
      });

      it('only one non-skipped player gets a role, the other role is unassigned', () => {
        // Positions: [0: skipped, 1: skipped, 2: active, 3: skipped]
        const pps = [
          makePlayerPoint({
            playerId: 1,
            position: 0,
            team: 'Red',
            skipped: true,
          }),
          makePlayerPoint({
            playerId: 2,
            position: 1,
            team: 'Red',
            skipped: true,
          }),
          makePlayerPoint({ playerId: 3, position: 2, team: 'Red' }),
          makePlayerPoint({
            playerId: 4,
            position: 3,
            team: 'Red',
            skipped: true,
          }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Red',
          'RedStrikerAtPositionZero',
        );
        // Only player 3 is non-skipped; firstIsStriker = true
        expect(flags.get(1)).toEqual({ isStriker: false, isDefender: false });
        expect(flags.get(2)).toEqual({ isStriker: false, isDefender: false });
        expect(flags.get(3)).toEqual({ isStriker: true, isDefender: false });
        expect(flags.get(4)).toEqual({ isStriker: false, isDefender: false });
      });
    });

    // ── All players skipped ──────────────────────────────────────────────
    describe('all players skipped', () => {
      it('assigns no flags to any player', () => {
        const pps = [
          makePlayerPoint({
            playerId: 1,
            position: 0,
            team: 'Red',
            skipped: true,
          }),
          makePlayerPoint({
            playerId: 2,
            position: 1,
            team: 'Red',
            skipped: true,
          }),
          makePlayerPoint({
            playerId: 3,
            position: 2,
            team: 'Red',
            skipped: true,
          }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Red',
          'RedStrikerAtPositionZero',
        );
        expect(flags.get(1)).toEqual({ isStriker: false, isDefender: false });
        expect(flags.get(2)).toEqual({ isStriker: false, isDefender: false });
        expect(flags.get(3)).toEqual({ isStriker: false, isDefender: false });
      });
    });

    // ── Empty team ───────────────────────────────────────────────────────
    describe('empty team', () => {
      it('returns an empty map', () => {
        const flags = service.computeStrikerDefenderFlags(
          [],
          'Red',
          'RedStrikerAtPositionZero',
        );
        expect(flags.size).toBe(0);
      });
    });

    // ── Unsorted input ───────────────────────────────────────────────────
    describe('unsorted input', () => {
      it('correctly sorts by position before assigning flags', () => {
        const pps = [
          makePlayerPoint({ playerId: 3, position: 2, team: 'Blue' }),
          makePlayerPoint({ playerId: 1, position: 0, team: 'Blue' }),
          makePlayerPoint({ playerId: 2, position: 1, team: 'Blue' }),
        ];
        const flags = service.computeStrikerDefenderFlags(
          pps,
          'Blue',
          'BlueStrikerAtPositionZero',
        );
        expect(flags.get(1)).toEqual({ isStriker: true, isDefender: false });
        expect(flags.get(2)).toEqual({ isStriker: false, isDefender: true });
        expect(flags.get(3)).toEqual({ isStriker: false, isDefender: false });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Integration: rotation + striker/defender flags
  // ─────────────────────────────────────────────────────────────────────────
  describe('rotation followed by striker/defender flag computation', () => {
    it('correctly assigns flags after rotating with a skipped player', () => {
      // Before rotation: [0: P1 active, 1: P2 skipped, 2: P3 active, 3: P4 active]
      const pps = [
        makePlayerPoint({ playerId: 1, position: 0, team: 'Blue' }),
        makePlayerPoint({
          playerId: 2,
          position: 1,
          team: 'Blue',
          skipped: true,
        }),
        makePlayerPoint({ playerId: 3, position: 2, team: 'Blue' }),
        makePlayerPoint({ playerId: 4, position: 3, team: 'Blue' }),
      ];

      const rotationResult = service.calculateRotatedPositionsForTeam(
        pps,
        true,
      );
      // P1 -> pos 2, P2 -> pos 3 (unskipped), P3 -> pos 0, P4 -> pos 1

      // Simulate creating new player points with rotated positions and cleared skips
      const newPps = pps.map((pp) => {
        const newPosition =
          rotationResult.positionsByPlayerId.get(pp.playerId) ?? pp.position;
        const newSkipped = rotationResult.playerIdsToUnskip.has(pp.playerId)
          ? false
          : pp.skipped;
        return makePlayerPoint({
          ...pp,
          position: newPosition,
          skipped: newSkipped,
        });
      });

      const flags = service.computeStrikerDefenderFlags(
        newPps,
        'Blue',
        'BlueStrikerAtPositionZero',
      );

      // P3 is now at position 0, P4 at position 1 — both active
      // P1 is at position 2 (active), P2 at position 3 (unskipped, now active)
      expect(flags.get(3)).toEqual({ isStriker: true, isDefender: false });
      expect(flags.get(4)).toEqual({ isStriker: false, isDefender: true });
      expect(flags.get(1)).toEqual({ isStriker: false, isDefender: false });
      expect(flags.get(2)).toEqual({ isStriker: false, isDefender: false });
    });

    it('handles the edge case where all except position 0 are skipped', () => {
      // Before rotation: [0: P1 active, 1: P2 skipped, 2: P3 skipped, 3: P4 skipped]
      const pps = [
        makePlayerPoint({ playerId: 1, position: 0, team: 'Red' }),
        makePlayerPoint({
          playerId: 2,
          position: 1,
          team: 'Red',
          skipped: true,
        }),
        makePlayerPoint({
          playerId: 3,
          position: 2,
          team: 'Red',
          skipped: true,
        }),
        makePlayerPoint({
          playerId: 4,
          position: 3,
          team: 'Red',
          skipped: true,
        }),
      ];

      const rotationResult = service.calculateRotatedPositionsForTeam(
        pps,
        true,
      );
      // splitIndex resets to 1:
      // P1 -> pos 3, P2 -> pos 0, P3 -> pos 1, P4 -> pos 2
      // No unskipping

      const newPps = pps.map((pp) => {
        const newPosition =
          rotationResult.positionsByPlayerId.get(pp.playerId) ?? pp.position;
        const newSkipped = rotationResult.playerIdsToUnskip.has(pp.playerId)
          ? false
          : pp.skipped;
        return makePlayerPoint({
          ...pp,
          position: newPosition,
          skipped: newSkipped,
        });
      });

      const flags = service.computeStrikerDefenderFlags(
        newPps,
        'Red',
        'RedStrikerAtPositionZero',
      );

      // P2 is now at pos 0 but still skipped, P3 at pos 1 still skipped, P4 at pos 2 still skipped
      // P1 at pos 3 is the ONLY non-skipped player
      // firstIsStriker = true for Red with RedStrikerAtPositionZero
      // First non-skipped = P1 (pos 3), no second non-skipped
      expect(flags.get(1)).toEqual({ isStriker: true, isDefender: false });
      expect(flags.get(2)).toEqual({ isStriker: false, isDefender: false });
      expect(flags.get(3)).toEqual({ isStriker: false, isDefender: false });
      expect(flags.get(4)).toEqual({ isStriker: false, isDefender: false });
    });

    it('correctly assigns flags after normal rotation with no skips', () => {
      const pps = [
        makePlayerPoint({ playerId: 1, position: 0, team: 'Blue' }),
        makePlayerPoint({ playerId: 2, position: 1, team: 'Blue' }),
        makePlayerPoint({ playerId: 3, position: 2, team: 'Blue' }),
      ];

      const rotationResult = service.calculateRotatedPositionsForTeam(
        pps,
        true,
      );

      const newPps = pps.map((pp) =>
        makePlayerPoint({
          ...pp,
          position:
            rotationResult.positionsByPlayerId.get(pp.playerId) ?? pp.position,
        }),
      );

      const flags = service.computeStrikerDefenderFlags(
        newPps,
        'Blue',
        'BlueStrikerAtPositionZero',
      );

      // After rotation: P2 at pos 0, P3 at pos 1, P1 at pos 2
      expect(flags.get(2)).toEqual({ isStriker: true, isDefender: false });
      expect(flags.get(3)).toEqual({ isStriker: false, isDefender: true });
      expect(flags.get(1)).toEqual({ isStriker: false, isDefender: false });
    });
  });
});
