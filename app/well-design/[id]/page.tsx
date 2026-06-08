// app/wells/[id]/page.tsx
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; simulated?: string }>;
}

export default async function WellPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { success, simulated } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch well
  const { data: well, error: wellError } = await supabase
    .from("wells")
    .select("*")
    .eq("id", id)
    .single();

  if (wellError || !well) {
    notFound();
  }

  // Fetch formation data
  const { data: formation } = await supabase
    .from("formation_data")
    .select("*")
    .eq("well_id", id)
    .maybeSingle();

  // Fetch mud program
  const { data: mudProgram } = await supabase
    .from("mud_programs")
    .select("*")
    .eq("well_id", id)
    .maybeSingle();

  // Fetch hole sections
  const { data: holeSections } = await supabase
    .from("hole_sections")
    .select("*")
    .eq("well_id", id)
    .order("top_depth_m", { ascending: true });

  // Fetch casing designs
  const { data: casingDesigns } = await supabase
    .from("casing_designs")
    .select("*")
    .eq("well_id", id)
    .order("top_depth_m", { ascending: true });

  // Fetch latest hydraulic simulation
  const { data: simulation } = await supabase
    .from("hydraulic_simulations")
    .select("*")
    .eq("well_id", id)
    .order("simulated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Success Banner */}
      {success === "true" && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
          Well design successfully created!
          {simulated === "true" && (
            <span> Hydraulic simulation completed.</span>
          )}
          {simulated === "false" && (
            <span> However, hydraulic simulation failed. Check backend logs.</span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{well.well_name}</h1>
          <p className="text-gray-500">
            {well.well_type} well • {well.status}
          </p>
        </div>
        <Link
          href="/wells/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + New Well
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: Basic info, geometry, formation, mud */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem label="Operator" value={well.operator_name} />
              <InfoItem label="Field" value={well.field_name} />
              <InfoItem label="Rig" value={well.rig_name} />
              <InfoItem label="Country" value={well.country} />
              <InfoItem label="Location" value={well.location} />
            </div>
          </div>

          {/* Well Geometry */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Well Geometry</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem
                label="Water Depth"
                value={well.water_depth_m ? `${well.water_depth_m} m` : "-"}
              />
              <InfoItem
                label="Total Depth"
                value={well.total_depth_m ? `${well.total_depth_m} m` : "-"}
              />
              <InfoItem
                label="Kickoff Depth"
                value={well.kickoff_depth_m ? `${well.kickoff_depth_m} m` : "-"}
              />
              <InfoItem
                label="Target Depth"
                value={well.target_depth_m ? `${well.target_depth_m} m` : "-"}
              />
              <InfoItem
                label="Drill Pipe OD"
                value={well.drill_pipe_od_in ? `${well.drill_pipe_od_in} in` : "-"}
              />
              <InfoItem
                label="Drill Pipe ID"
                value={well.drill_pipe_id_in ? `${well.drill_pipe_id_in} in` : "-"}
              />
            </div>
          </div>

          {/* Formation Data */}
          {formation && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Formation Data</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem
                  label="Top Depth"
                  value={formation.formation_top_m ? `${formation.formation_top_m} m` : "-"}
                />
                <InfoItem
                  label="Bottom Depth"
                  value={formation.formation_bottom_m ? `${formation.formation_bottom_m} m` : "-"}
                />
                <InfoItem
                  label="Pore Pressure"
                  value={
                    formation.pore_pressure_ppg
                      ? `${formation.pore_pressure_ppg} ppg (${(formation.pore_pressure_ppg * 0.052).toFixed(3)} psi/ft)`
                      : "-"
                  }
                />
                <InfoItem
                  label="Fracture Gradient"
                  value={
                    formation.fracture_gradient_ppg
                      ? `${formation.fracture_gradient_ppg} ppg (${(formation.fracture_gradient_ppg * 0.052).toFixed(3)} psi/ft)`
                      : "-"
                  }
                />
                <InfoItem label="Lithology" value={formation.lithology} />
              </div>
            </div>
          )}

          {/* Mud Program */}
          {mudProgram && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Mud Program</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="Mud Type" value={mudProgram.mud_type} />
                <InfoItem
                  label="Density"
                  value={mudProgram.density_ppg ? `${mudProgram.density_ppg} ppg` : "-"}
                />
                <InfoItem
                  label="Viscosity"
                  value={mudProgram.viscosity_cp ? `${mudProgram.viscosity_cp} cP` : "-"}
                />
                <InfoItem
                  label="Yield Point"
                  value={
                    mudProgram.yield_point_lbf100ft2
                      ? `${mudProgram.yield_point_lbf100ft2} lbf/100ft²`
                      : "-"
                  }
                />
                <InfoItem
                  label="Solid Content"
                  value={
                    mudProgram.solid_content_pct ? `${mudProgram.solid_content_pct}%` : "-"
                  }
                />
                <InfoItem
                  label="Flow Rate"
                  value={mudProgram.flow_rate_gpm ? `${mudProgram.flow_rate_gpm} gpm` : "-"}
                />
              </div>
            </div>
          )}

          {/* Hole Sections Table */}
          {holeSections && holeSections.length > 0 && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Hole Sections</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Section Name</th>
                      <th className="px-4 py-2 text-left">Top (m)</th>
                      <th className="px-4 py-2 text-left">Bottom (m)</th>
                      <th className="px-4 py-2 text-left">Hole Size (in)</th>
                      <th className="px-4 py-2 text-left">Mud Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holeSections.map((section) => (
                      <tr key={section.id} className="border-b">
                        <td className="px-4 py-2">{section.section_name || "-"}</td>
                        <td className="px-4 py-2">{section.top_depth_m ?? "-"}</td>
                        <td className="px-4 py-2">{section.bottom_depth_m ?? "-"}</td>
                        <td className="px-4 py-2">{section.hole_size_in ?? "-"}</td>
                        <td className="px-4 py-2">{section.mud_type || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Casing Design Table */}
          {casingDesigns && casingDesigns.length > 0 && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Casing Design</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Top (m)</th>
                      <th className="px-4 py-2 text-left">Bottom (m)</th>
                      <th className="px-4 py-2 text-left">OD (in)</th>
                      <th className="px-4 py-2 text-left">ID (in)</th>
                      <th className="px-4 py-2 text-left">Weight (lb/ft)</th>
                      <th className="px-4 py-2 text-left">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {casingDesigns.map((casing) => (
                      <tr key={casing.id} className="border-b">
                        <td className="px-4 py-2">{casing.casing_name || "-"}</td>
                        <td className="px-4 py-2">{casing.top_depth_m ?? "-"}</td>
                        <td className="px-4 py-2">{casing.bottom_depth_m ?? "-"}</td>
                        <td className="px-4 py-2">{casing.outer_diameter_in ?? "-"}</td>
                        <td className="px-4 py-2">{casing.inner_diameter_in ?? "-"}</td>
                        <td className="px-4 py-2">{casing.weight_lbft ?? "-"}</td>
                        <td className="px-4 py-2">{casing.grade || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Hydraulic Simulation Results */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Hydraulic Simulation</h2>
            {simulation ? (
              <div className="space-y-4">
                <div className="rounded-md bg-blue-50 p-3">
                  <p className="text-xs uppercase text-blue-700">Latest Run</p>
                  <p className="text-sm">
                    {new Date(simulation.simulated_at).toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    label="ECD"
                    value={`${simulation.ecd_ppg ?? "—"} ppg`}
                    tooltip="Equivalent Circulating Density"
                  />
                  <StatCard
                    label="BHP"
                    value={`${simulation.bhp_psi ?? "—"} psi`}
                    tooltip="Bottomhole Pressure"
                  />
                  <StatCard
                    label="Annular Friction"
                    value={`${simulation.friction_loss_psi ?? "—"} psi`}
                    tooltip="Friction pressure loss in annulus"
                  />
                  <StatCard
                    label="Annular Velocity"
                    value={`${simulation.annular_velocity_ftmin ?? "—"} ft/min`}
                    tooltip="Velocity of mud in annulus"
                  />
                  <StatCard
                    label="Flow Rate"
                    value={`${simulation.flow_rate_gpm ?? "—"} gpm`}
                  />
                  <StatCard
                    label="Bit Depth"
                    value={`${simulation.bit_depth_ft ?? "—"} ft`}
                  />
                </div>
                {simulation.choke_pressure_psi && (
                  <div className="mt-4 rounded-md bg-yellow-50 p-3 text-center">
                    <p className="text-sm font-medium">Recommended Choke Pressure</p>
                    <p className="text-2xl font-bold">{simulation.choke_pressure_psi} psi</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md bg-gray-50 p-6 text-center text-gray-500">
                <p>No hydraulic simulation available.</p>
                <p className="mt-2 text-sm">
                  The backend may not have been called or returned an error.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || "—"}</dd>
    </div>
  );
}

function StatCard({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div className="rounded-md bg-gray-50 p-3 text-center" title={tooltip}>
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}