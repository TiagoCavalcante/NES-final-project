import { z } from "zod"

const parsePossibleFloat = (value: string) => {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

export const IncompleteCollegeSchema = z.object({
  INSTNM: z.string(),
  CITY: z.string(),
  ADM_RATE: z.string().transform(parsePossibleFloat),
  SATVR25: z.string().transform(parsePossibleFloat),
  SATVRMID: z.string().transform(parsePossibleFloat),
  SATVR75: z.string().transform(parsePossibleFloat),
  SATMT25: z.string().transform(parsePossibleFloat),
  SATMTMID: z.string().transform(parsePossibleFloat),
  SATMT75: z.string().transform(parsePossibleFloat),
  SATWR25: z.string().transform(parsePossibleFloat),
  SATWRMID: z.string().transform(parsePossibleFloat),
  SATWR75: z.string().transform(parsePossibleFloat),
  SAT_AVG: z.string().transform(parsePossibleFloat),
  FEMALE: z.string().transform(parsePossibleFloat),
  FIRST_GEN: z.string().transform(parsePossibleFloat),
  TUITIONFEE_IN: z.string().transform(parsePossibleFloat),
  TUITIONFEE_OUT: z.string().transform(parsePossibleFloat),
})

export const CompleteCollegeSchema = z.object({
  INSTNM: z.string(),
  CITY: z.string(),
  ADM_RATE: z.string().nonempty().transform(parseFloat),
  SATVR25: z.string().nonempty().transform(parseFloat),
  SATVRMID: z.string().nonempty().transform(parseFloat),
  SATVR75: z.string().nonempty().transform(parseFloat),
  SATMT25: z.string().nonempty().transform(parseFloat),
  SATMTMID: z.string().nonempty().transform(parseFloat),
  SATMT75: z.string().nonempty().transform(parseFloat),
  SATWR25: z.string().nonempty().transform(parseFloat),
  SATWRMID: z.string().nonempty().transform(parseFloat),
  SATWR75: z.string().nonempty().transform(parseFloat),
  SAT_AVG: z.string().nonempty().transform(parseFloat),
  FEMALE: z.string().nonempty().transform(parseFloat),
  FIRST_GEN: z.string().nonempty().transform(parseFloat),
  TUITIONFEE_IN: z.string().nonempty().transform(parseFloat),
  TUITIONFEE_OUT: z.string().nonempty().transform(parseFloat),
})

export type College = z.infer<typeof CompleteCollegeSchema>

export const csvFile = "/filtered_data.csv"
