// See https://en.wikipedia.org/wiki/Levenshtein_distance
// Code from https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
const editDistance = (s1: string, s2: string) => {
  const costs = []

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0) {
        costs[j] = j
      } else {
        if (j > 0) {
          let newValue = costs[j - 1]

          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
          }

          costs[j - 1] = lastValue
          lastValue = newValue
        }
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue
    }
  }

  return costs[s2.length]
}

export const similarity = (s1: string, s2: string) => {
  let longer = s1
  let shorter = s2

  if (s1.length < s2.length) {
    longer = s2
    shorter = s1
  }

  const longerLength = longer.length

  return (longerLength - editDistance(longer, shorter)) / longerLength
}
