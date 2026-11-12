/** Generate the next sequential reference number matching `${prefix}-${NNN}` (e.g. PR-2026-113). */
export function nextSequentialNumber(
  prefix: string,
  existingNumbers: Array<string | undefined | null>,
  padWidth = 3,
  minNumber = 1,
): string {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^${escaped}-(\\d+)$`, 'i');
  let maxNum = minNumber - 1;
  for (const raw of existingNumbers) {
    if (!raw) continue;
    const m = re.exec(raw.trim());
    if (m) {
      const parsed = Number(m[1]);
      if (Number.isFinite(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }
  return `${prefix}-${String(maxNum + 1).padStart(padWidth, '0')}`;
}
