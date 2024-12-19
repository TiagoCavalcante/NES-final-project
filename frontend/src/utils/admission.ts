import { College } from "../schemas/college"

export type UserInput = {
  satCriticalReading: number
  satMath: number
  satWriting: number
}

export type PredictionResult = {
  probability: number
}

// Calculates the mean and standard deviation based on the 25th, 50th, and 75th percentiles.
// Assumes a normal distribution.
const calculateMeanStdDev = (
  p25: number,
  p50: number,
  p75: number,
): { mean: number; stdDev: number } => {
  // For a normal distribution, mean ≈ p50
  const mean = p50

  // Estimate standard deviation using the distance between percentiles
  // In a normal distribution:
  // p75 ≈ mean + 0.6745 * stdDev
  // p25 ≈ mean - 0.6745 * stdDev
  const stdDev75 = (p75 - mean) / 0.6745
  const stdDev25 = (mean - p25) / 0.6745

  const stdDev = (stdDev25 + stdDev75) / 2

  return { mean, stdDev }
}

// Calculates the cumulative probability using the Gaussian Cumulative Distribution Function (CDF).
// Utilizes the error function (erf) approximation.
const calculateCumulativeProbability = (
  score: number,
  mean: number,
  stdDev: number,
): number => {
  // Handle cases where stdDev is zero or negative
  if (stdDev <= 0) {
    return score >= mean ? 100 : 0
  }

  // Calculate z-score adjusted by sqrt(2)
  const z = (score - mean) / stdDev
  const zDivSqrt2 = z / Math.sqrt(2)

  // Approximation of the error function
  const t = 1 / (1 + 0.3275911 * Math.abs(zDivSqrt2))
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429

  const erf =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-zDivSqrt2 * zDivSqrt2)

  // Calculate CDF based on the sign of zDivSqrt2
  const cdf = zDivSqrt2 >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf)

  return cdf * 100 // Convert to percentage
}

export const predictAdmissionProbability = (
  college: College,
  input: UserInput,
): PredictionResult => {
  // Calculate mean and stdDev for each section
  const criticalReading = calculateMeanStdDev(
    college.SATVR25,
    college.SATVRMID,
    college.SATVR75,
  )
  const math = calculateMeanStdDev(
    college.SATMT25,
    college.SATMTMID,
    college.SATMT75,
  )
  const writing = calculateMeanStdDev(
    college.SATWR25,
    college.SATWRMID,
    college.SATWR75,
  )

  // Calculate cumulative probabilities for each section
  const crProb = calculateCumulativeProbability(
    input.satCriticalReading,
    criticalReading.mean,
    criticalReading.stdDev,
  )
  const mtProb = calculateCumulativeProbability(
    input.satMath,
    math.mean,
    math.stdDev,
  )
  const wrProb = calculateCumulativeProbability(
    input.satWriting,
    writing.mean,
    writing.stdDev,
  )

  // Average the probabilities across sections
  const averageProb = (crProb + mtProb + wrProb) / 3

  const admRatePercent = college.ADM_RATE * 100
  const finalProbability = admRatePercent * (averageProb / 50)

  // Ensure the probability is between 0% and 100%
  const boundedProbability = Math.min(Math.max(finalProbability, 0), 100)

  return {
    probability: boundedProbability,
  }
}
