// app/wells/create/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { submitCompleteWellDesign } from "../actions";
import {
  WellInformationData,
  HoleSection,
  CasingDesign,
  FormationData,
  MudProgram,
  CompleteWellDesign,
} from "./types";

// Helper for localStorage
const STORAGE_KEY = "mpd_well_design_draft";

// Steps definition
const STEPS = [
  { id: "well_information", title: "Well Information" },
  { id: "hole_sections", title: "Hole Sections" },
  { id: "casing_design", title: "Casing Design" },
  { id: "formation_data", title: "Formation Data" },
  { id: "mud_program", title: "Mud Program" },
  { id: "review", title: "Review & Submit" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// Default empty state
const DEFAULT_WELL_DATA: CompleteWellDesign = {
  well_information: {
    well_name: "",
    well_type: "Exploration",
    operator_name: "",
    field_name: "",
    country: "",
    location: "",
    rig_name: "",
    status: "active",
    water_depth: null,
    total_depth: null,
    kickoff_depth: null,
    target_depth: null,
    drill_pipe_od_in: 0,   
    drill_pipe_id_in: 0,   
  },
  hole_sections: [],
  casing_design: [],
  formation_data: {
    
    formation_top: null,
    formation_bottom: null,
    pore_pressure_gradient: null,
    fracture_gradient: null,
      formation_top_m: null,                    // renamed + _m suffix
  formation_bottom_m: null,                 // renamed + _m suffix
  pore_pressure_psi_per_ft: null,           // renamed
  fracture_gradient_psi_per_ft: null,
    lithology: "",
  },
  mud_program: {
    mud_type: "Water Based",
  density_ppg: null,                 // renamed
  viscosity_cp: null,                // renamed
  yield_point_lbf100ft2: null,       // renamed
  solid_content_pct: null,           // renamed
  flow_rate_gpm: null,  
    density: null,
    viscosity: null,
    yield_point: null,
    solid_content: null,
  },
};

// Load from localStorage
const loadDraft = (): CompleteWellDesign => {
  if (typeof window === "undefined") return DEFAULT_WELL_DATA;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_WELL_DATA;
  try {
    return JSON.parse(stored) as CompleteWellDesign;
  } catch {
    return DEFAULT_WELL_DATA;
  }
};

// Save to localStorage
const saveDraft = (data: CompleteWellDesign) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export default function CreateWellWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepId>("well_information");
  const [wellData, setWellData] = useState<CompleteWellDesign>(DEFAULT_WELL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    setWellData(draft);
  }, []);

  // Auto-save on data change
  useEffect(() => {
    if (wellData !== DEFAULT_WELL_DATA) {
      saveDraft(wellData);
    }
  }, [wellData]);

  // Update partial data
  const updateWellData = useCallback(
    <K extends keyof CompleteWellDesign>(section: K, data: CompleteWellDesign[K]) => {
      setWellData((prev) => ({ ...prev, [section]: data }));
    },
    []
  );

  const currentIndex = useMemo(
    () => STEPS.findIndex((s) => s.id === currentStep),
    [currentStep]
  );
  const isLastStep = currentStep === "review";
  const isFirstStep = currentIndex === 0;

  const goNext = () => {
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
      setError(null);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
      setError(null);
    }
  };

  const handleSubmit = async () => {
  setIsSubmitting(true);
  setError(null);
  try {
    const result = await submitCompleteWellDesign(wellData);
    if (result.success) {
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/well-design/${result.wellId}?success=true&simulated=${!!result.simulation}`);
    } else {
      setError(result.error || "Failed to create well design");
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "An unexpected error occurred");
  } finally {
    setIsSubmitting(false);
  }
};

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case "well_information":
        return (
          <WellInformationStep
            data={wellData.well_information}
            onChange={(data) => updateWellData("well_information", data)}
          />
        );
      case "hole_sections":
        return (
          <HoleSectionsStep
            data={wellData.hole_sections}
            onChange={(data) => updateWellData("hole_sections", data)}
          />
        );
      case "casing_design":
        return (
          <CasingDesignStep
            data={wellData.casing_design}
            onChange={(data) => updateWellData("casing_design", data)}
          />
        );
      case "formation_data":
        return (
          <FormationDataStep
            data={wellData.formation_data}
            onChange={(data) => updateWellData("formation_data", data)}
          />
        );
      case "mud_program":
        return (
          <MudProgramStep
            data={wellData.mud_program}
            onChange={(data) => updateWellData("mud_program", data)}
          />
        );
      case "review":
        return <ReviewStep data={wellData} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Well Design</h1>
        <p className="mt-2 text-gray-500">
          Multi-step engineering workflow for MPD data collection
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  currentIndex >= idx
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    currentIndex > idx ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              )}
              <span className="absolute mt-8 hidden text-xs font-medium text-gray-500 md:block">
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center md:hidden">
          <span className="text-sm font-medium text-gray-600">
            Step {currentIndex + 1} of {STEPS.length}:{" "}
            {STEPS[currentIndex].title}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-xl  border bg-white p-6 shadow-sm">{renderStep()}</div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={goPrev}
          disabled={isFirstStep}
          className={`rounded-lg px-6 py-2 text-sm font-medium ${
            isFirstStep
              ? "cursor-not-allowed bg-gray-100 text-gray-900"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Previous
        </button>

        {!isLastStep ? (
          <button
            onClick={goNext}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Ready for Hydraulics"}
          </button>
        )}
      </div>
    </div>
  );
}

// ======================
// Step Components
// ======================

function WellInformationStep({
  data,
  onChange,
}: {
  data: WellInformationData;
  onChange: (data: WellInformationData) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue =
      e.target instanceof HTMLInputElement && e.target.type === "number"
        ? value === ""
          ? null
          : Number(value)
        : value;
    onChange({ ...data, [name]: parsedValue });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl text-gray-900 font-semibold text-gray-900">Basic Information & Geometry</h2>
      <div className="grid gap-6 md:grid-cols-2 text-gray-900">
        <Input
          label="Well Name"
          name="well_name"
          value={data.well_name}
          onChange={handleChange}
          required
        />
        <Select
          label="Well Type"
          name="well_type"
          value={data.well_type}
          onChange={handleChange}
          options={["Exploration", "Development", "Appraisal", "Injection"]}
        />
        <Input
          label="Operator Name"
          name="operator_name"
          value={data.operator_name}
          onChange={handleChange}
        />
        <Input
          label="Field Name"
          name="field_name"
          value={data.field_name}
          onChange={handleChange}
        />
        <Input
          label="Country"
          name="country"
          value={data.country}
          onChange={handleChange}
        />
        <Input
          label="Location"
          name="location"
          value={data.location}
          onChange={handleChange}
        />
        <Input
          label="Rig Name"
          name="rig_name"
          value={data.rig_name}
          onChange={handleChange}
        />
        <Select
          label="Status"
          name="status"
          value={data.status}
          onChange={handleChange}
          options={["active", "completed", "abandoned", "suspended"]}
        />
        <Input
          type="number"
          label="Water Depth (m)"
          name="water_depth"
          value={data.water_depth ?? ""}
          onChange={handleChange}
        />
        <Input
          type="number"
          label="Total Depth (m)"
          name="total_depth"
          value={data.total_depth ?? ""}
          onChange={handleChange}
        />
        <Input
          type="number"
          label="Kickoff Depth (m)"
          name="kickoff_depth"
          value={data.kickoff_depth ?? ""}
          onChange={handleChange}
        />
        <Input
          type="number"
          label="Target Depth (m)"
          name="target_depth"
          value={data.target_depth ?? ""}
          onChange={handleChange}
        />
        
<Input
  type="number"
  label="Drill Pipe OD (in)"
  name="drill_pipe_od_in"
  value={data.drill_pipe_od_in ?? ""}
  onChange={handleChange}
/>
<Input
  type="number"
  label="Drill Pipe ID (in)"
  name="drill_pipe_id_in"
  value={data.drill_pipe_id_in ?? ""}
  onChange={handleChange}
/>
      </div>
    </div>
  );
}

function HoleSectionsStep({
  data,
  onChange,
}: {
  data: HoleSection[];
  onChange: (data: HoleSection[]) => void;
}) {
  const addSection = () => {
    const newId = crypto.randomUUID();
    onChange([
      ...data,
      {
        id: newId,
        section_name: "",
        top_depth: null,
        bottom_depth: null,
        hole_size: null,
        hole_size_in: null,
        mud_type: "",
      },
    ]);
  };

  const updateSection = (id: string, updates: Partial<HoleSection>) => {
    onChange(data.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSection = (id: string) => {
    onChange(data.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-gray-900 font-semibold">Hole Sections</h2>
        <button
          type="button"
          onClick={addSection}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          + Add Section
        </button>
      </div>

      {data.length === 0 && (
        <p className="text-center text-gray-500">No hole sections added yet.</p>
      )}

      <div className="space-y-6">
        {data.map((section, idx) => (
          <div key={section.id} className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">Section {idx + 1}</h3>
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3 text-gray-900">
              <Input
                label="Section Name"
                value={section.section_name}
                onChange={(e) =>
                  updateSection(section.id, { section_name: e.target.value })
                }
              />
              <Input
                type="number"
                label="Top Depth (m)"
                value={section.top_depth ?? ""}
                onChange={(e) =>
                  updateSection(section.id, {
                    top_depth: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
              <Input
                type="number"
                label="Bottom Depth (m)"
                value={section.bottom_depth ?? ""}
                onChange={(e) =>
                  updateSection(section.id, {
                    bottom_depth: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
              <Input
                type="number"
                label="Hole Size (in)"
                value={section.hole_size ?? ""}
                onChange={(e) =>
                  updateSection(section.id, {
                    hole_size: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
              <Input
                label="Mud Type"
                value={section.mud_type ?? ""}
                onChange={(e) =>
                  updateSection(section.id, { mud_type: e.target.value })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CasingDesignStep({
  data,
  onChange,
}: {
  data: CasingDesign[];
  onChange: (data: CasingDesign[]) => void;
}) {
  const addCasing = () => {
    const newId = crypto.randomUUID();
    onChange([
      ...data,
      {
        id: newId,
        casing_name: "",
        top_depth: null,
        bottom_depth: null,
        outer_diameter: null,
        inner_diameter: null,
        weight: null,
        outer_diameter_in: null,
        inner_diameter_in: null,
        weight_lbft: null,
        grade: "",
      },
    ]);
  };

  const updateCasing = (id: string, updates: Partial<CasingDesign>) => {
    onChange(data.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const removeCasing = (id: string) => {
    onChange(data.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-gray-900 font-semibold">Casing Design</h2>
        <button
          type="button"
          onClick={addCasing}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          + Add Casing String
        </button>
      </div>

      {data.length === 0 && (
        <p className="text-center text-gray-500">No casing strings added yet.</p>
      )}

      <div className="space-y-6">
        {data.map((casing, idx) => (
          <div key={casing.id} className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">Casing {idx + 1}</h3>
              <button
                type="button"
                onClick={() => removeCasing(casing.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-4 text-gray-900">
              <Input
                label="Casing Name"
                value={casing.casing_name}
                onChange={(e) => updateCasing(casing.id, { casing_name: e.target.value })}
              />
              <Input
                type="number"
                label="Top Depth (m)"
                value={casing.top_depth ?? ""}
                onChange={(e) =>
                  updateCasing(casing.id, {
                    top_depth: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
              <Input
                type="number"
                label="Bottom Depth (m)"
                value={casing.bottom_depth ?? ""}
                onChange={(e) =>
                  updateCasing(casing.id, {
                    bottom_depth: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
              <Input
                type="number"
                label="Outer Diameter (in)"
                value={casing.outer_diameter ?? ""}
                onChange={(e) =>
                  updateCasing(casing.id, {
                    outer_diameter: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
              <Input
                type="number"
                label="Inner Diameter (in)"
                value={casing.inner_diameter ?? ""}
                onChange={(e) =>
                  updateCasing(casing.id, {
                    inner_diameter: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
              <Input
                type="number"
                label="Weight (lb/ft)"
                value={casing.weight ?? ""}
                onChange={(e) =>
                  updateCasing(casing.id, {
                    weight: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
              <Input
                label="Grade"
                value={casing.grade ?? ""}
                onChange={(e) => updateCasing(casing.id, { grade: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormationDataStep({
  data,
  onChange,
}: {
  data: FormationData;
  onChange: (data: FormationData) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue =
      e.target.type === "number" ? (value === "" ? null : Number(value)) : value;
    onChange({ ...data, [name]: parsedValue });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl text-gray-900 font-semibold">Formation Data</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          type="number"
          label="Formation Top (m)"
          name="formation_top"
          value={data.formation_top ?? ""}
          onChange={handleChange}
        />
        <Input
          type="number"
          label="Formation Bottom (m)"
          name="formation_bottom"
          value={data.formation_bottom ?? ""}
          onChange={handleChange}
        />
        <Input
          type="number"
          label="Pore Pressure Gradient (psi/ft)"
          name="pore_pressure_gradient"
          value={data.pore_pressure_gradient ?? ""}
          onChange={handleChange}
          step="0.01"
        />
        <Input
          type="number"
          label="Fracture Gradient (psi/ft)"
          name="fracture_gradient"
          value={data.fracture_gradient ?? ""}
          onChange={handleChange}
          step="0.01"
        />
        <Input
          label="Lithology"
          name="lithology"
          value={data.lithology ?? ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

function MudProgramStep({
  data,
  onChange,
}: {
  data: MudProgram;
  onChange: (data: MudProgram) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue =
      e.target instanceof HTMLInputElement && e.target.type === "number"
        ? value === ""
          ? null
          : Number(value)
        : value;
    onChange({ ...data, [name]: parsedValue });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl text-gray-900 font-semibold">Mud Program</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Select
          label="Mud Type"
          name="mud_type"
          value={data.mud_type}
          onChange={handleChange}
          options={["Water Based", "Oil Based", "Synthetic Based"]}
        />
        <Input
          type="number"
          label="Density (ppg)"
          name="density"
          value={data.density ?? ""}
          onChange={handleChange}
          step="0.1"
        />
        <Input
          type="number"
          label="Viscosity (cP)"
          name="viscosity"
          value={data.viscosity ?? ""}
          onChange={handleChange}
        />
        <Input
          type="number"
          label="Yield Point (lb/100ft²)"
          name="yield_point"
          value={data.yield_point ?? ""}
          onChange={handleChange}
        />
        <Input
          type="number"
          label="Solid Content (%)"
          name="solid_content"
          value={data.solid_content ?? ""}
          onChange={handleChange}
          step="0.1"
        />
        <Input
  type="number"
  label="Flow Rate (gpm)"
  name="flow_rate_gpm"
  value={data.flow_rate_gpm ?? ""}
  onChange={handleChange}
  step="10"
/>
<Input
  type="number"
  label="Plastic Viscosity (cP)"
  name="viscosity_cp"
  value={data.viscosity_cp ?? ""}
  onChange={handleChange}
/>
<Input
  type="number"
  label="Yield Point (lbf/100ft²)"
  name="yield_point_lbf100ft2"
  value={data.yield_point_lbf100ft2 ?? ""}
  onChange={handleChange}
/>
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: CompleteWellDesign }) {
  return (
    <div className="space-y-8">
      <h2 className="text-xl text-gray-900 font-semibold">Review Well Design</h2>

      {/* Well Information Summary */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-medium text-blue-700">Well Information</h3>
        <div className="grid gap-2 text-sm md:grid-cols-2">
          <ReviewItem label="Well Name" value={data.well_information.well_name} />
          <ReviewItem label="Well Type" value={data.well_information.well_type} />
          <ReviewItem label="Operator" value={data.well_information.operator_name} />
          <ReviewItem label="Field" value={data.well_information.field_name} />
          <ReviewItem label="Country" value={data.well_information.country} />
          <ReviewItem label="Location" value={data.well_information.location} />
          <ReviewItem label="Rig" value={data.well_information.rig_name} />
          <ReviewItem label="Status" value={data.well_information.status} />
          <ReviewItem
            label="Water Depth"
            value={data.well_information.water_depth ? `${data.well_information.water_depth} m` : "-"}
          />
          <ReviewItem
            label="Total Depth"
            value={data.well_information.total_depth ? `${data.well_information.total_depth} m` : "-"}
          />
          <ReviewItem
            label="Kickoff Depth"
            value={data.well_information.kickoff_depth ? `${data.well_information.kickoff_depth} m` : "-"}
          />
          <ReviewItem
            label="Target Depth"
            value={data.well_information.target_depth ? `${data.well_information.target_depth} m` : "-"}
          />
        </div>
      </div>

      {/* Hole Sections */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-medium text-blue-700">
          Hole Sections ({data.hole_sections.length})
        </h3>
        {data.hole_sections.length === 0 ? (
          <p className="text-sm text-gray-500">No sections defined</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Top (m)</th>
                  <th className="px-2 py-1 text-left">Bottom (m)</th>
                  <th className="px-2 py-1 text-left">Hole Size (in)</th>
                  <th className="px-2 py-1 text-left">Mud Type</th>
                </tr>
              </thead>
              <tbody>
                {data.hole_sections.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="px-2 py-1">{s.section_name || "-"}</td>
                    <td className="px-2 py-1">{s.top_depth ?? "-"}</td>
                    <td className="px-2 py-1">{s.bottom_depth ?? "-"}</td>
                    <td className="px-2 py-1">{s.hole_size ?? "-"}</td>
                    <td className="px-2 py-1">{s.mud_type || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Casing Design */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-medium text-blue-700">
          Casing Design ({data.casing_design.length})
        </h3>
        {data.casing_design.length === 0 ? (
          <p className="text-sm text-gray-500">No casing strings defined</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Top (m)</th>
                  <th className="px-2 py-1 text-left">Bottom (m)</th>
                  <th className="px-2 py-1 text-left">OD (in)</th>
                  <th className="px-2 py-1 text-left">ID (in)</th>
                  <th className="px-2 py-1 text-left">Weight (lb/ft)</th>
                  <th className="px-2 py-1 text-left">Grade</th>
                </tr>
              </thead>
              <tbody>
                {data.casing_design.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="px-2 py-1">{c.casing_name || "-"}</td>
                    <td className="px-2 py-1">{c.top_depth ?? "-"}</td>
                    <td className="px-2 py-1">{c.bottom_depth ?? "-"}</td>
                    <td className="px-2 py-1">{c.outer_diameter ?? "-"}</td>
                    <td className="px-2 py-1">{c.inner_diameter ?? "-"}</td>
                    <td className="px-2 py-1">{c.weight ?? "-"}</td>
                    <td className="px-2 py-1">{c.grade || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formation & Mud */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-medium text-blue-700">Formation Data</h3>
          <div className="space-y-1 text-sm">
            <ReviewItem label="Formation Top" value={data.formation_data.formation_top ? `${data.formation_data.formation_top} m` : "-"} />
            <ReviewItem label="Formation Bottom" value={data.formation_data.formation_bottom ? `${data.formation_data.formation_bottom} m` : "-"} />
            <ReviewItem label="Pore Pressure Gradient" value={data.formation_data.pore_pressure_gradient ? `${data.formation_data.pore_pressure_gradient} psi/ft` : "-"} />
            <ReviewItem label="Fracture Gradient" value={data.formation_data.fracture_gradient ? `${data.formation_data.fracture_gradient} psi/ft` : "-"} />
            <ReviewItem label="Lithology" value={data.formation_data.lithology || "-"} />
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-medium text-blue-700">Mud Program</h3>
          <div className="space-y-1 text-sm">
            <ReviewItem label="Mud Type" value={data.mud_program.mud_type} />
            <ReviewItem label="Density" value={data.mud_program.density ? `${data.mud_program.density} ppg` : "-"} />
            <ReviewItem label="Viscosity" value={data.mud_program.viscosity ? `${data.mud_program.viscosity} cP` : "-"} />
            <ReviewItem label="Yield Point" value={data.mud_program.yield_point ? `${data.mud_program.yield_point} lb/100ft²` : "-"} />
            <ReviewItem label="Solid Content" value={data.mud_program.solid_content ? `${data.mud_program.solid_content}%` : "-"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between border-b py-1">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="text-gray-900">{value || "-"}</span>
    </div>
  );
}

// Reusable form components
function Input({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
  step,
}: {
  label: string;
  name?: string;
  type?: string;
  required?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        value={value ?? ""}
        onChange={onChange}
        step={step}
        className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}