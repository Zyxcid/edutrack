import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { predict } from "../services/api";

// ── Initial Form State ─────────────────────────────────────────────────────
const initialForm = {
  // Step 1 - Personal
  Gender: "Male",
  Parental_Education_Level: "High School",
  Family_Income: "Medium",
  Learning_Disabilities: "No",
  Distance_from_Home: "Near",
  // Step 2 - Academic
  Previous_Scores: "",
  Attendance: "",
  School_Type: "Public",
  Teacher_Quality: "Medium",
  Access_to_Resources: "Medium",
  // Step 3 - Study Habits
  Hours_Studied: "",
  Sleep_Hours: "",
  Tutoring_Sessions: "",
  Motivation_Level: "Medium",
  Extracurricular_Activities: "No",
  // Step 4 - Environment
  Parental_Involvement: "Medium",
  Internet_Access: "Yes",
  Peer_Influence: "Neutral",
  Physical_Activity: "",
};

// ── Step Config ────────────────────────────────────────────────────────────
const steps = [
  { label: "Personal" },
  { label: "Academic" },
  { label: "Study Habits" },
  { label: "Environment" },
];

// ── Reusable Field Components ──────────────────────────────────────────────
function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="form-control w-full">
      <div className="label pb-1">
        <span className="label-text text-sm font-medium">{label}</span>
      </div>
      <select name={name} value={value} onChange={onChange} className="select select-bordered w-full">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

function NumberField({ label, name, value, onChange, placeholder, min, max }) {
  return (
    <label className="form-control w-full">
      <div className="label pb-1">
        <span className="label-text text-sm font-medium">{label}</span>
      </div>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="input input-bordered w-full"
      />
    </label>
  );
}

// ── Step Forms ─────────────────────────────────────────────────────────────
function Step1({ form, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SelectField label="Gender" name="Gender" value={form.Gender} onChange={onChange}
        options={["Male", "Female"]} />
      <SelectField label="Parental Education Level" name="Parental_Education_Level" value={form.Parental_Education_Level} onChange={onChange}
        options={["High School", "College", "Postgraduate"]} />
      <SelectField label="Family Income" name="Family_Income" value={form.Family_Income} onChange={onChange}
        options={["Low", "Medium", "High"]} />
      <SelectField label="Learning Disabilities" name="Learning_Disabilities" value={form.Learning_Disabilities} onChange={onChange}
        options={["Yes", "No"]} />
      <SelectField label="Distance from Home" name="Distance_from_Home" value={form.Distance_from_Home} onChange={onChange}
        options={["Near", "Moderate", "Far"]} />
    </div>
  );
}

function Step2({ form, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField label="Previous Scores (0-100)" name="Previous_Scores" value={form.Previous_Scores}
        onChange={onChange} placeholder="e.g. 75" min={0} max={100} />
      <NumberField label="Attendance (%)" name="Attendance" value={form.Attendance}
        onChange={onChange} placeholder="e.g. 85" min={0} max={100} />
      <SelectField label="School Type" name="School_Type" value={form.School_Type} onChange={onChange}
        options={["Public", "Private"]} />
      <SelectField label="Teacher Quality" name="Teacher_Quality" value={form.Teacher_Quality} onChange={onChange}
        options={["Low", "Medium", "High"]} />
      <SelectField label="Access to Resources" name="Access_to_Resources" value={form.Access_to_Resources} onChange={onChange}
        options={["Low", "Medium", "High"]} />
    </div>
  );
}

function Step3({ form, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField label="Hours Studied per Week" name="Hours_Studied" value={form.Hours_Studied}
        onChange={onChange} placeholder="e.g. 15" min={0} max={100} />
      <NumberField label="Sleep Hours per Night" name="Sleep_Hours" value={form.Sleep_Hours}
        onChange={onChange} placeholder="e.g. 7" min={0} max={24} />
      <NumberField label="Tutoring Sessions per Month" name="Tutoring_Sessions" value={form.Tutoring_Sessions}
        onChange={onChange} placeholder="e.g. 2" min={0} max={30} />
      <SelectField label="Motivation Level" name="Motivation_Level" value={form.Motivation_Level} onChange={onChange}
        options={["Low", "Medium", "High"]} />
      <SelectField label="Extracurricular Activities" name="Extracurricular_Activities" value={form.Extracurricular_Activities} onChange={onChange}
        options={["Yes", "No"]} />
    </div>
  );
}

function Step4({ form, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SelectField label="Parental Involvement" name="Parental_Involvement" value={form.Parental_Involvement} onChange={onChange}
        options={["Low", "Medium", "High"]} />
      <SelectField label="Internet Access" name="Internet_Access" value={form.Internet_Access} onChange={onChange}
        options={["Yes", "No"]} />
      <SelectField label="Peer Influence" name="Peer_Influence" value={form.Peer_Influence} onChange={onChange}
        options={["Positive", "Neutral", "Negative"]} />
      <NumberField label="Physical Activity (hours/week)" name="Physical_Activity" value={form.Physical_Activity}
        onChange={onChange} placeholder="e.g. 3" min={0} max={30} />
    </div>
  );
}

// ── Validation ─────────────────────────────────────────────────────────────
function validateStep(step, form) {
  if (step === 1) {
    if (!form.Previous_Scores || !form.Attendance) return "Please fill all required fields."
    if (form.Previous_Scores < 0 || form.Previous_Scores > 100) return "Previous Scores must be between 0-100."
    if (form.Attendance < 0 || form.Attendance > 100) return "Attendance must be between 0-100."
  }
  if (step === 2) {
    if (!form.Hours_Studied || !form.Sleep_Hours || !form.Tutoring_Sessions) return "Please fill all required fields."
  }
  if (step === 3) {
    if (!form.Physical_Activity) return "Please fill all required fields."
  }
  return null
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function PredictPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    const err = validateStep(currentStep, form)
    if (err) { setError(err); return; }
    setError("");
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const err = validateStep(currentStep, form)
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        Hours_Studied: Number(form.Hours_Studied),
        Attendance: Number(form.Attendance),
        Sleep_Hours: Number(form.Sleep_Hours),
        Previous_Scores: Number(form.Previous_Scores),
        Tutoring_Sessions: Number(form.Tutoring_Sessions),
        Physical_Activity: Number(form.Physical_Activity),
      };

      // Kirim ke Express → FastAPI → simpan ke DB
      await predict(payload);

      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepComponents = [
    <Step1 form={form} onChange={handleChange} />,
    <Step2 form={form} onChange={handleChange} />,
    <Step3 form={form} onChange={handleChange} />,
    <Step4 form={form} onChange={handleChange} />,
  ];

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="mb-8 text-2xl font-extrabold text-primary">EduTrack</div>

      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold">Student Performance Analysis</h1>
          <p className="text-base-content/50 text-sm mt-1">
            Fill in the student data to get AI-powered predictions and recommendations.
          </p>
        </div>

        {/* Step Indicator */}
        <ul className="steps w-full mb-8">
          {steps.map((step, i) => (
            <li key={step.label} className={`step ${i <= currentStep ? "step-primary" : ""}`}>
              {step.label}
            </li>
          ))}
        </ul>

        {/* Card */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body gap-6">

            {/* Step Title */}
            <h2 className="text-lg font-bold">
              Step {currentStep + 1}: {steps[currentStep].label} Information
            </h2>

            {/* Step Form */}
            {stepComponents[currentStep]}

            {/* Error */}
            {error && (
              <div className="alert alert-error text-sm py-2">
                <span>{error}</span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-2">
              <button
                className="btn btn-ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                ← Back
              </button>

              {currentStep < steps.length - 1 ? (
                <button className="btn btn-primary" onClick={handleNext}>
                  Next →
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? <span className="loading loading-spinner loading-sm" />
                    : "Predict Now 🎯"}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Step counter */}
        <p className="text-center text-sm text-base-content/40 mt-4">
          Step {currentStep + 1} of {steps.length}
        </p>

      </div>
    </div>
  );
}