// app/wells/actions.ts (updated)
"use server";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CompleteWellDesign } from "./create/types";

// Helper: meters to feet
const mToFt = (m: number | null) => (m !== null ? m * 3.28084 : null);
// Helper: psi/ft to ppg (ppg = psi/ft / 0.052)
const psiPerFtToPpg = (psiPerFt: number | null) => (psiPerFt !== null ? psiPerFt / 0.052 : null);

export async function submitCompleteWellDesign(data: CompleteWellDesign) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Insert well record
  const wellPayload = {
    well_name: data.well_information.well_name,
    well_type: data.well_information.well_type,
    operator_name: data.well_information.operator_name,
    field_name: data.well_information.field_name,
    country: data.well_information.country,
    location: data.well_information.location,
    rig_name: data.well_information.rig_name,
    status: data.well_information.status,
    water_depth_m: data.well_information.water_depth,
    total_depth_m: data.well_information.total_depth,
    kickoff_depth_m: data.well_information.kickoff_depth,
    target_depth_m: data.well_information.target_depth,
    drill_pipe_od_in: data.well_information.drill_pipe_od_in,
    drill_pipe_id_in: data.well_information.drill_pipe_id_in,
  };

  const { data: well, error: wellError } = await supabase
    .from("wells")
    .insert(wellPayload)
    .select("id")
    .single();

  if (wellError) {
    console.error("Well insert error:", wellError);
    return { success: false, error: wellError.message };
  }

  const wellId = well.id;

  // 2. Insert hole sections (with metric depths)
  if (data.hole_sections.length > 0) {
    const sectionsPayload = data.hole_sections.map((section) => ({
      well_id: wellId,
      section_name: section.section_name,
      top_depth_m: section.top_depth,
      bottom_depth_m: section.bottom_depth,
      hole_size_in: section.hole_size_in,
      mud_type: section.mud_type,
    }));
    const { error: sectionsError } = await supabase
      .from("hole_sections")
      .insert(sectionsPayload);
    if (sectionsError) {
      await cleanupOnError(supabase, wellId);
      return { success: false, error: sectionsError.message };
    }
  }

  // 3. Insert casing designs (metric depths)
  if (data.casing_design.length > 0) {
    const casingPayload = data.casing_design.map((casing) => ({
      well_id: wellId,
      casing_name: casing.casing_name,
      top_depth_m: casing.top_depth,
      bottom_depth_m: casing.bottom_depth,
      outer_diameter_in: casing.outer_diameter_in,
      inner_diameter_in: casing.inner_diameter_in,
      weight_lbft: casing.weight_lbft,
      grade: casing.grade,
    }));
    const { error: casingError } = await supabase
      .from("casing_designs")
      .insert(casingPayload);
    if (casingError) {
      await cleanupOnError(supabase, wellId);
      return { success: false, error: casingError.message };
    }
  }

  // 4. Insert formation data (convert to imperial for backend)
  const formationTopFt = mToFt(data.formation_data.formation_top_m);
  const formationBottomFt = mToFt(data.formation_data.formation_bottom_m);
  const porePressurePpg = psiPerFtToPpg(data.formation_data.pore_pressure_psi_per_ft);
  const fractureGradientPpg = psiPerFtToPpg(data.formation_data.fracture_gradient_psi_per_ft);

  const formationPayload = {
    well_id: wellId,
    formation_top_ft: formationTopFt,
    formation_bottom_ft: formationBottomFt,
    pore_pressure_ppg: porePressurePpg,
    fracture_gradient_ppg: fractureGradientPpg,
    lithology: data.formation_data.lithology,
  };
  const { error: formationError } = await supabase
    .from("formation_data")
    .insert(formationPayload);
  if (formationError) {
    await cleanupOnError(supabase, wellId);
    return { success: false, error: formationError.message };
  }

  // 5. Insert mud program
  const mudPayload = {
    well_id: wellId,
    mud_type: data.mud_program.mud_type,
    density_ppg: data.mud_program.density_ppg,
    viscosity_cp: data.mud_program.viscosity_cp,
    yield_point_lbf100ft2: data.mud_program.yield_point_lbf100ft2,
    solid_content_pct: data.mud_program.solid_content_pct,
    flow_rate_gpm: data.mud_program.flow_rate_gpm,
  };
  const { error: mudError } = await supabase
    .from("mud_programs")
    .insert(mudPayload);
  if (mudError) {
    await cleanupOnError(supabase, wellId);
    return { success: false, error: mudError.message };
  }

  // 6. Call railway backend for hydraulics simulation
  const railwayUrl = process.env.RAILWAY_BACKEND_URL;
  let simulationResult = null;
  if (railwayUrl) {
    // Prepare simulation input
    const totalDepthFt = mToFt(data.well_information.total_depth) ?? 0;
    const holeSizeIn = data.hole_sections[0]?.hole_size_in ?? 8.5;
    const drillPipeOdIn = data.well_information.drill_pipe_od_in ?? 5.0;
    const drillPipeIdIn = data.well_information.drill_pipe_id_in ?? 4.0;
    const flowRateGpm = data.mud_program.flow_rate_gpm ?? 300;
    const mudWeightPpg = data.mud_program.density_ppg ?? 12;
    const plasticViscosityCp = data.mud_program.viscosity_cp ?? 20;
    const yieldPoint = data.mud_program.yield_point_lbf100ft2 ?? 15;

    const simulationPayload = {
      well_id: wellId,
      flow_rate_gpm: flowRateGpm,
      bit_depth_ft: totalDepthFt,
      mud_weight_ppg: mudWeightPpg,
      plastic_viscosity_cp: plasticViscosityCp,
      yield_point_lbf100ft2: yieldPoint,
      drill_pipe_od_in: drillPipeOdIn,
      drill_pipe_id_in: drillPipeIdIn,
      hole_size_in: holeSizeIn,
      surface_temperature_f: 75,
      simulation_type: "static",
    };

    try {
      const response = await fetch(`${railwayUrl}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simulationPayload),
      });
      if (response.ok) {
        simulationResult = await response.json();
      } else {
        console.warn("Railway simulation failed:", await response.text());
      }
    } catch (err) {
      console.error("Error calling railway backend:", err);
    }
  }

  revalidatePath("/wells");
  return {
    success: true,
    wellId,
    simulation: simulationResult,
  };
}

async function cleanupOnError(supabase: any, wellId: string) {
  await supabase.from("wells").delete().eq("id", wellId);
}