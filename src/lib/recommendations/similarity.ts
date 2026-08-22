export function cosineSimilarity(a: Array<number>, b: Array<number>): number {
  let dot = 0
  let magA = 0
  let magB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }

  if (magA === 0 || magB === 0) return 0

  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

export function pearsonCorrelation(a: Array<number>, b: Array<number>): number {
  const n = a.length
  if (n === 0) return 0

  const meanA = a.reduce((sum, value) => sum + value, 0) / n
  const meanB = b.reduce((sum, value) => sum + value, 0) / n

  let numerator = 0
  let varA = 0
  let varB = 0

  for (let i = 0; i < n; i++) {
    const diffA = a[i] - meanA
    const diffB = b[i] - meanB
    numerator += diffA * diffB
    varA += diffA * diffA
    varB += diffB * diffB
  }

  if (varA === 0 || varB === 0) return 0

  return numerator / Math.sqrt(varA * varB)
}
