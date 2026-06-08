// app/wells/create/types.ts
export interface WellInformationData {
  well_name: string;
  well_type: string;
  operator_name: string;
  field_name: string;
  country: string;
  location: string;
  rig_name: string;
  status: string;
  water_depth: number | null;
  total_depth: number | null;
  kickoff_depth: number | null;
  target_depth: number | null;
}

export interface HoleSection {
  id: string;
  section_name: string;
  top_depth: number | null;
  bottom_depth: number | null;
  hole_size: number | null;
  mud_type: string;
}

export interface CasingDesign {
  id: string;
  casing_name: string;
  top_depth: number | null;
  bottom_depth: number | null;
  outer_diameter: number | null;
  inner_diameter: number | null;
  weight: number | null;
  grade: string;
}

export interface FormationData {
  formation_top: number | null;
  formation_bottom: number | null;
  pore_pressure_gradient: number | null;
  fracture_gradient: number | null;
  lithology: string;
}

export interface MudProgram {
  mud_type: string;
  density: number | null;
  viscosity: number | null;
  yield_point: number | null;
  solid_content: number | null;
}

export interface CompleteWellDesign {
  well_information: WellInformationData;
  hole_sections: HoleSection[];
  casing_design: CasingDesign[];
  formation_data: FormationData;
  mud_program: MudProgram;
}

// app/wells/create/types.ts (updated)
export interface WellInformationData {
  well_name: string;
  well_type: string;
  operator_name: string;
  field_name: string;
  country: string;
  location: string;
  rig_name: string;
  status: string;
  water_depth: number | null;      // meters
  total_depth: number | null;      // meters
  kickoff_depth: number | null;    // meters
  target_depth: number | null;     // meters
  drill_pipe_od_in: number | null; // inches
  drill_pipe_id_in: number | null; // inches
}

export interface HoleSection {
  id: string;
  section_name: string;
  top_depth: number | null;     // meters
  bottom_depth: number | null;  // meters
  hole_size_in: number | null;  // inches
  mud_type: string;
}

export interface CasingDesign {
  id: string;
  casing_name: string;
  top_depth: number | null;     // meters
  bottom_depth: number | null;  // meters
  outer_diameter_in: number | null;
  inner_diameter_in: number | null;
  weight_lbft: number | null;
  grade: string;
}

export interface FormationData {
  formation_top_m: number | null;          // meters
  formation_bottom_m: number | null;       // meters
  pore_pressure_psi_per_ft: number | null; // psi/ft
  fracture_gradient_psi_per_ft: number | null;
  lithology: string;
}

export interface MudProgram {
  mud_type: string;
  density_ppg: number | null;
  viscosity_cp: number | null;
  yield_point_lbf100ft2: number | null;
  solid_content_pct: number | null;
  flow_rate_gpm: number | null;  // added for simulation
}

export interface CompleteWellDesign {
  well_information: WellInformationData;
  hole_sections: HoleSection[];
  casing_design: CasingDesign[];
  formation_data: FormationData;
  mud_program: MudProgram;
}