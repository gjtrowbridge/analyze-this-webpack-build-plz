/**
 * Attempts to convert a random thing into a valid integer.
 * If this fails, returns null.
 */
export function convertToInteger(input: unknown): number | null {
  const num = Number(input)
  if (isNaN(num)) {
    return null
  }
  return Math.round(num)
}
