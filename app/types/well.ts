

export type WellFormData = {
  well_name: string
  well_type: string
  operator_name: string
  field_name: string
  country: string
  location: string
  rig_name: string
  status: string
  water_depth: number | null
  total_depth: number | null
  kickoff_depth: number | null
  target_depth: number | null
}