
export function getStatistics(arr: Array<number>) {
  if (arr.length === 0) {
    return { mean: 0, standardDeviation: 0 }
  }
  const mean = arr.reduce((acc, val) => { return acc + val }, 0) / arr.length
  const sumSquares = arr.reduce((acc, val) => {
    const squareDiff = Math.pow(mean - val, 2)
    return acc + squareDiff
  }, 0)
  const standardDeviation = Math.sqrt(sumSquares / arr.length)
  return {
    mean,
    standardDeviation,
  }
}

export function getPercentage(args: {
  numerator: number,
  denominator: number
}): string {
  const { numerator, denominator } = args
  if (denominator === 0) {
    return 'Unknown %'
  }
  return `${Math.round(numerator / denominator * 1000) / 10}%`
}

export function inKB(num: number) {
  const kb = num / 1024
  return Math.round(kb * 10) / 10
}
