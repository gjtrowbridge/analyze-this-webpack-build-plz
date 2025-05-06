
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
}): number {
  const { numerator, denominator } = args
  if (denominator === 0) {
    return 0
  }
  return numerator / denominator * 100
}

export function inKB(num: number) {
  const kb = num / 1024
  return Math.round(kb * 100) / 100
}

export function getHumanReadableSize(num: number): string {
  const labels = ['bytes', 'kb', 'mb', 'gb']
  let currentNum = num
  let currentLabel = labels[0]
  for (let i = 0; i<labels.length; i++) {
    currentLabel = labels[i]
    if (currentNum < 1024) {
      break
    }
    currentNum = currentNum / 1024
  }
  return `${Math.round(currentNum * 100) / 100} ${currentLabel}`
}

export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
