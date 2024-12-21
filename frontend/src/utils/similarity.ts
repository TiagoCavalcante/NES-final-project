// Internal cache to avoid recomputing distances for the same string pairs.
const distanceCache: Record<string, number> = {}

// Computes Levenshtein distance using a single-row DP approach.
export const editDistanceOptimized = (
  s1: string,
  s2: string,
  maxDistance = Number.MAX_SAFE_INTEGER,
) => {
  // Quick check for identical strings
  if (s1 === s2) {
    return 0
  }

  // Use a cache key that is order-independent.
  // This ensures editDistance(s1,s2) == editDistance(s2,s1) is cached properly.
  const cacheKey = s1 < s2 ? `${s1}|${s2}` : `${s2}|${s1}`
  if (distanceCache[cacheKey] !== undefined) {
    return distanceCache[cacheKey]
  }

  const m = s1.length
  const n = s2.length

  // If one string is empty, distance = length of the other.
  if (m === 0) {
    distanceCache[cacheKey] = n
    return n
  } else if (n === 0) {
    distanceCache[cacheKey] = m
    return m
  }

  // We will hold the current and previous row values in this single array.
  // Initialize row with 0..n
  const costs = new Uint16Array(n + 1)
  for (let j = 0; j <= n; j++) {
    costs[j] = j
  }

  // Core DP loop
  for (let i = 1; i <= m; i++) {
    // "prev" will store costs[j-1] from the previous iteration of j
    // Start by updating the leftmost cell in the row (costs[0]) => i
    let prev = costs[0]
    costs[0] = i

    // If we've already exceeded maxDistance just from costs[0], early out
    if (costs[0] > maxDistance) {
      distanceCache[cacheKey] = Number.MAX_SAFE_INTEGER
      return Number.MAX_SAFE_INTEGER
    }

    const c1 = s1.charCodeAt(i - 1)

    for (let j = 1; j <= n; j++) {
      // temp is the old costs[j] before we overwrite it
      const temp = costs[j]
      const c2 = s2.charCodeAt(j - 1)

      if (c1 === c2) {
        // Characters match => no additional cost beyond prev
        costs[j] = prev
      } else {
        // Characters differ => 1 + min(insert, delete, substitute)
        // insert  => costs[j]   (we haven't yet updated it, it's from the previous i)
        // delete  => costs[j-1] (just updated in this iteration)
        // replace => prev       (the diagonal element we stored in prev)
        costs[j] = 1 + Math.min(costs[j], costs[j - 1], prev)
      }

      // Prepare for the next iteration: "prev" becomes what used to be costs[j]
      prev = temp

      // Optional early-out if we exceed maxDistance
      if (costs[j] > maxDistance) {
        distanceCache[cacheKey] = Number.MAX_SAFE_INTEGER
        return Number.MAX_SAFE_INTEGER
      }
    }
  }

  const dist = costs[n]
  distanceCache[cacheKey] = dist
  return dist
}

// Returns a similarity measure between 0 and 1, based on the Levenshtein distance.
// - 1 means identical
// - 0 means completely different
export const similarity = (s1: string, s2: string) => {
  let longer = s1
  let shorter = s2
  // Swap if s2 is longer
  if (longer.length < shorter.length) {
    ;[longer, shorter] = [shorter, longer]
  }

  // If the longer string is empty, both strings must be empty => similarity = 1
  const longerLength = longer.length
  if (longerLength === 0) {
    return 1.0
  }

  // Compute distance
  const dist = editDistanceOptimized(longer, shorter)

  // Convert distance to similarity
  return (longerLength - dist) / longerLength
}
