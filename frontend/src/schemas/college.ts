import { z } from "zod"

export const CollegeSchema = z.object({
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

export type College = z.infer<typeof CollegeSchema>

export const csvFile = "/filtered_data.csv"
