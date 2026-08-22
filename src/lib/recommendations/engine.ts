import { cosineSimilarity, pearsonCorrelation } from '#/lib/recommendations/similarity'

export interface Interaction {
  userId: string
  productId: string
  type: 'view' | 'purchase' | 'rating'
  value: number
}

export type ScoreMatrix = Map<string, Map<string, number>>

const INTERACTION_WEIGHT: Record<Interaction['type'], number> = {
  view: 1,
  purchase: 4,
  rating: 1,
}

export function buildInteractionScores(
  interactions: Array<Interaction>,
): ScoreMatrix {
  const matrix: ScoreMatrix = new Map()

  for (const interaction of interactions) {
    const weight =
      interaction.type === 'rating'
        ? interaction.value
        : interaction.value * INTERACTION_WEIGHT[interaction.type]

    const userScores = matrix.get(interaction.userId) ?? new Map<string, number>()
    userScores.set(
      interaction.productId,
      (userScores.get(interaction.productId) ?? 0) + weight,
    )
    matrix.set(interaction.userId, userScores)
  }

  return matrix
}

function allScoredProductIds(matrix: ScoreMatrix): Array<string> {
  const ids = new Set<string>()
  for (const userScores of matrix.values()) {
    for (const productId of userScores.keys()) ids.add(productId)
  }
  return [...ids]
}

function denseVector(userScores: Map<string, number> | undefined, productIds: Array<string>) {
  return productIds.map((id) => userScores?.get(id) ?? 0)
}

function minMaxNormalize(scores: Map<string, number>): Map<string, number> {
  if (scores.size === 0) return new Map()

  const values = [...scores.values()]
  const min = Math.min(...values)
  const max = Math.max(...values)

  if (max === min) {
    return new Map([...scores.keys()].map((id) => [id, 1]))
  }

  return new Map([...scores].map(([id, value]) => [id, (value - min) / (max - min)]))
}

export function userBasedScores(
  targetUserId: string,
  matrix: ScoreMatrix,
  candidateIds: Array<string>,
  k = 5,
): Map<string, number> {
  const targetScores = matrix.get(targetUserId)
  const result = new Map<string, number>()
  if (!targetScores || targetScores.size === 0) return result

  const productIds = allScoredProductIds(matrix)
  const targetVector = denseVector(targetScores, productIds)

  const neighbors: Array<{ userId: string; correlation: number }> = []
  for (const [userId, otherScores] of matrix) {
    if (userId === targetUserId) continue
    const otherVector = denseVector(otherScores, productIds)
    const correlation = pearsonCorrelation(targetVector, otherVector)
    if (correlation > 0) neighbors.push({ userId, correlation })
  }

  neighbors.sort((a, b) => b.correlation - a.correlation)
  const topNeighbors = neighbors.slice(0, k)
  if (topNeighbors.length === 0) return result

  for (const candidateId of candidateIds) {
    let weightedSum = 0
    let weightTotal = 0
    for (const neighbor of topNeighbors) {
      const neighborScore = matrix.get(neighbor.userId)?.get(candidateId)
      if (neighborScore === undefined) continue
      weightedSum += neighborScore * neighbor.correlation
      weightTotal += neighbor.correlation
    }
    if (weightTotal > 0) result.set(candidateId, weightedSum / weightTotal)
  }

  return result
}

export function itemBasedScores(
  targetUserId: string,
  matrix: ScoreMatrix,
  candidateIds: Array<string>,
): Map<string, number> {
  const targetScores = matrix.get(targetUserId)
  const result = new Map<string, number>()
  if (!targetScores || targetScores.size === 0) return result

  const userIds = [...matrix.keys()]
  const itemVector = (productId: string) =>
    userIds.map((userId) => matrix.get(userId)?.get(productId) ?? 0)

  const interactedIds = [...targetScores.keys()]

  for (const candidateId of candidateIds) {
    const candidateVector = itemVector(candidateId)
    let weightedSum = 0
    let weightTotal = 0
    for (const interactedId of interactedIds) {
      const similarity = cosineSimilarity(candidateVector, itemVector(interactedId))
      if (similarity <= 0) continue
      weightedSum += similarity * (targetScores.get(interactedId) ?? 0)
      weightTotal += similarity
    }
    if (weightTotal > 0) result.set(candidateId, weightedSum / weightTotal)
  }

  return result
}

export interface RecommendationResult {
  productId: string
  score: number
  strategy: 'user-cf' | 'item-cf'
}

export function recommend({
  targetUserId,
  matrix,
  candidateIds,
  limit = 8,
  k = 5,
}: {
  targetUserId: string
  matrix: ScoreMatrix
  candidateIds: Array<string>
  limit?: number
  k?: number
}): Array<RecommendationResult> {
  const targetScores = matrix.get(targetUserId)
  if (!targetScores || targetScores.size === 0) return []

  const userScores = minMaxNormalize(userBasedScores(targetUserId, matrix, candidateIds, k))
  const itemScores = minMaxNormalize(itemBasedScores(targetUserId, matrix, candidateIds))

  const combined = new Map<string, RecommendationResult>()
  for (const candidateId of candidateIds) {
    const userScore = userScores.get(candidateId) ?? 0
    const itemScore = itemScores.get(candidateId) ?? 0
    if (userScore === 0 && itemScore === 0) continue

    combined.set(candidateId, {
      productId: candidateId,
      score: (userScore + itemScore) / 2,
      strategy: userScore >= itemScore ? 'user-cf' : 'item-cf',
    })
  }

  return [...combined.values()].sort((a, b) => b.score - a.score).slice(0, limit)
}

export interface PopularityInput {
  id: string
  createdAt: Date
  rating: { average: number; count: number }
}

export function popularityRank<T extends PopularityInput>(products: Array<T>): Array<T> {
  return [...products].sort((a, b) => {
    if (b.rating.average !== a.rating.average) return b.rating.average - a.rating.average
    if (b.rating.count !== a.rating.count) return b.rating.count - a.rating.count
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}
