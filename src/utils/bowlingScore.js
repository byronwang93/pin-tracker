// Pure, synchronous 10-frame bowling scoring engine — no UI/React here.
// `frames` is an array of { rolls: [{ pinsDown: [...] }, ...] }, built up one
// roll at a time as a game is played. `pinsDown` is the pins knocked down on
// THAT roll (not the pins remaining) — this matches what `gameAttempts()` in
// `src/utils/stats.js` already expects when it later reads this same field.

const ALL_PINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const LAST_FRAME = 9; // 0-indexed, so frame 10

const pinCount = (roll) => roll?.pinsDown?.length ?? 0;
const isStrikeRoll = (roll) => pinCount(roll) === 10;

// What roll comes next, and what pins are standing for it. Derived purely
// from the frames built so far instead of tracked as separate index state,
// so the frame/roll bookkeeping (including the tenth-frame special case)
// lives in exactly one place.
export const getGameState = (frames = []) => {
  for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
    const isTenth = frameIndex === LAST_FRAME;
    const rolls = frames[frameIndex]?.rolls ?? [];

    if (!isTenth) {
      if (rolls.length === 0) {
        return { frameIndex, rollIndex: 0, standingPins: ALL_PINS, isTenth, isComplete: false };
      }
      if (rolls.length === 1 && !isStrikeRoll(rolls[0])) {
        const standingPins = ALL_PINS.filter((pin) => !rolls[0].pinsDown.includes(pin));
        return { frameIndex, rollIndex: 1, standingPins, isTenth, isComplete: false };
      }
      // strike, or both balls thrown — frame done, move to the next one
      continue;
    }

    // Tenth frame
    if (rolls.length === 0) {
      return { frameIndex, rollIndex: 0, standingPins: ALL_PINS, isTenth, isComplete: false };
    }
    if (rolls.length === 1) {
      const standingPins = isStrikeRoll(rolls[0])
        ? ALL_PINS
        : ALL_PINS.filter((pin) => !rolls[0].pinsDown.includes(pin));
      return { frameIndex, rollIndex: 1, standingPins, isTenth, isComplete: false };
    }
    const rolls0Strike = isStrikeRoll(rolls[0]);
    const openFrame = !rolls0Strike && pinCount(rolls[0]) + pinCount(rolls[1]) < 10;
    if (rolls.length === 2 && !openFrame) {
      // After a strike+non-strike, the third roll faces that second roll's
      // leave. Every other case (strike+strike, or any spare) resets to a
      // fresh rack of 10.
      const standingPins = rolls0Strike && !isStrikeRoll(rolls[1])
        ? ALL_PINS.filter((pin) => !rolls[1].pinsDown.includes(pin))
        : ALL_PINS;
      return { frameIndex, rollIndex: 2, standingPins, isTenth, isComplete: false };
    }
    // open tenth (done after 2) or the bonus third roll has been thrown
    return { frameIndex: LAST_FRAME, rollIndex: rolls.length, standingPins: [], isTenth, isComplete: true };
  }
  // frames 0-8 were all strikes and frame 10 hasn't started — unreachable in
  // practice since the loop above returns from within frame 10 first, kept
  // only as a safe fallback.
  return { frameIndex: LAST_FRAME, rollIndex: 0, standingPins: ALL_PINS, isTenth: true, isComplete: false };
};

// Appends `pinsDown` as the next roll, in the correct frame/slot. The caller
// never manipulates frame indices directly — it just calls this after every
// shot and re-derives state from the result via `getGameState`.
export const submitRoll = (frames = [], pinsDown) => {
  const { frameIndex } = getGameState(frames);
  const next = frames.map((frame) => ({ rolls: [...frame.rolls] }));
  while (next.length <= frameIndex) next.push({ rolls: [] });
  next[frameIndex].rolls.push({ pinsDown: [...pinsDown].sort((a, b) => a - b) });
  return next;
};

// Removes the single most recent roll — e.g. a mis-tap of "Miss" instead of
// "Strike". `submitRoll` only ever grows the frames array by exactly one
// frame at a time, so the last frame in the array is always the one most
// recently touched, and it always holds at least the roll just added.
export const undoLastRoll = (frames = []) => {
  if (frames.length === 0) return frames;
  const next = frames.map((frame) => ({ rolls: [...frame.rolls] }));
  next[next.length - 1].rolls.pop();
  if (next[next.length - 1].rolls.length === 0) next.pop();
  return next;
};

// Per-frame cumulative running score, `null` for a frame that can't be
// resolved yet (e.g. a strike still waiting on its two bonus rolls).
export const frameScores = (frames = []) => {
  const rolls = frames.flatMap((frame) => frame.rolls.map(pinCount));
  const results = [];
  let rollIndex = 0;
  let total = 0;

  for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
    const isTenth = frameIndex === LAST_FRAME;
    const frameRollCount = frames[frameIndex]?.rolls?.length ?? 0;

    if (!isTenth) {
      if (frameRollCount === 0) {
        results.push(null);
        continue;
      }
      if (rolls[rollIndex] === 10) {
        // strike — needs the next two rolls thrown to resolve
        if (rolls[rollIndex + 1] === undefined || rolls[rollIndex + 2] === undefined) {
          results.push(null);
          continue;
        }
        total += 10 + rolls[rollIndex + 1] + rolls[rollIndex + 2];
        rollIndex += 1;
      } else if (frameRollCount < 2) {
        results.push(null);
        continue;
      } else if (rolls[rollIndex] + rolls[rollIndex + 1] === 10) {
        // spare — needs one more roll to resolve
        if (rolls[rollIndex + 2] === undefined) {
          results.push(null);
          continue;
        }
        total += 10 + rolls[rollIndex + 2];
        rollIndex += 2;
      } else {
        total += rolls[rollIndex] + rolls[rollIndex + 1];
        rollIndex += 2;
      }
      results.push(total);
    } else {
      const { isComplete } = getGameState(frames);
      if (!isComplete) {
        results.push(null);
        continue;
      }
      total += frames[frameIndex].rolls.reduce((sum, roll) => sum + pinCount(roll), 0);
      results.push(total);
    }
  }

  return results;
};

export const totalScore = (frames = []) => {
  const scores = frameScores(frames);
  return scores[scores.length - 1] ?? 0;
};

// Display marks per roll for a frame box: "X" (strike), "/" (spare), "-"
// (gutter/miss), or the pin count. Walks the rolls tracking whether the rack
// is "fresh" (10 standing — true at the start of a frame, and again after any
// strike/spare in the tenth, which is the only frame that keeps going).
export const frameDisplayMarks = (frame) => {
  const rolls = frame?.rolls ?? [];
  const marks = [];
  let standing = 10;
  let freshRack = true;

  for (const roll of rolls) {
    const count = pinCount(roll);
    if (freshRack) {
      marks.push(count === 10 ? "X" : count === 0 ? "-" : String(count));
      standing = 10 - count;
      freshRack = count === 10;
    } else if (count === standing) {
      marks.push("/");
      freshRack = true;
    } else {
      marks.push(count === 0 ? "-" : String(count));
      freshRack = false;
    }
  }

  return marks;
};
