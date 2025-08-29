export function difficultyToRating(diff: number): number {
  // Map 1..5 -> 800, 1000, 1200, 1400, 1600
  return 800 + (diff - 1) * 200;
}

export function expectedScore(userAbility: number, qRating: number): number {
  return 1 / (1 + Math.pow(10, (qRating - userAbility) / 400));
}

export function updateAbility(userAbility: number, qDiff: number, correct: boolean, K = 32): number {
  const qRating = difficultyToRating(qDiff);
  const exp = expectedScore(userAbility, qRating);
  const result = correct ? 1 : 0;
  const next = userAbility + K * (result - exp);
  // Clamp ability to a sensible range
  return Math.max(600, Math.min(1600, next));
}

export function abilityToLevel(ability: number): string {
  if (ability < 950) return 'Foundation';
  if (ability < 1050) return 'Core';
  if (ability < 1150) return 'Strong';
  if (ability < 1250) return 'Advanced';
  return 'Elite';
}
