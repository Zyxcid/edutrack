import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { simulate, getCurrentPrediction } from "../../services/api"

export default function WhatIf() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [simForm, setSimForm] = useState(null)
  const [simScore, setSimScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simLoading, setSimLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCurrentPrediction()
        setResult(res.data.prediction)
        setSimForm(res.data.prediction?.input ?? null)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleChange = (e) => {
    setSimForm({ ...simForm, [e.target.name]: e.target.value })
    setSimScore(null)
  }

  const handleSimulate = async () => {
    setError("")
    setSimLoading(true)
    try {
      const payload = {
        ...simForm,
        Hours_Studied: Number(simForm.Hours_Studied),
        Attendance: Number(simForm.Attendance),
        Sleep_Hours: Number(simForm.Sleep_Hours),
        Previous_Scores: Number(simForm.Previous_Scores),
        Tutoring_Sessions: Number(simForm.Tutoring_Sessions),
        Physical_Activity: Number(simForm.Physical_Activity),
      }
      const res = await simulate(payload)
      setSimScore(res.data.predicted_exam_score)
    } catch (err) {
      setError("Simulation failed. Please try again.")
    } finally {
      setSimLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (!result || !simForm) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-base-content/50">No prediction this week yet.</p>
        <button className="btn btn-primary" onClick={() => navigate('/predict')}>
          Start Prediction
        </button>
      </div>
    )
  }

  const baselineScore = result.predicted_score
  const diff = simScore !== null ? simScore - baselineScore : null

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold">What-If Simulation</h1>
        <p className="text-base-content/50 text-sm mt-1">
          Adjust parameters below to see how they affect the predicted score.
        </p>
      </div>

      {/* GRID UTAMA: Form kiri, Hasil kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: Form Input (2/3 lebar) */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow">
            <div className="card-body gap-4">
              <h2 className="font-bold">Adjust Parameters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text text-sm font-medium">Hours Studied/Week</span>
                    <span className="label-text-alt text-base-content/40">current: {result.input.Hours_Studied}</span>
                  </div>
                  <input type="number" name="Hours_Studied" value={simForm.Hours_Studied}
                    onChange={handleChange} className="input input-bordered" min={0} max={100} />
                </label>

                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text text-sm font-medium">Attendance (%)</span>
                    <span className="label-text-alt text-base-content/40">current: {result.input.Attendance}</span>
                  </div>
                  <input type="number" name="Attendance" value={simForm.Attendance}
                    onChange={handleChange} className="input input-bordered" min={0} max={100} />
                </label>

                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text text-sm font-medium">Sleep Hours/Night</span>
                    <span className="label-text-alt text-base-content/40">current: {result.input.Sleep_Hours}</span>
                  </div>
                  <input type="number" name="Sleep_Hours" value={simForm.Sleep_Hours}
                    onChange={handleChange} className="input input-bordered" min={0} max={24} />
                </label>

                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text text-sm font-medium">Tutoring Sessions/Month</span>
                    <span className="label-text-alt text-base-content/40">current: {result.input.Tutoring_Sessions}</span>
                  </div>
                  <input type="number" name="Tutoring_Sessions" value={simForm.Tutoring_Sessions}
                    onChange={handleChange} className="input input-bordered" min={0} max={30} />
                </label>

                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text text-sm font-medium">Motivation Level</span>
                    <span className="label-text-alt text-base-content/40">current: {result.input.Motivation_Level}</span>
                  </div>
                  <select name="Motivation_Level" value={simForm.Motivation_Level}
                    onChange={handleChange} className="select select-bordered">
                    {["Low", "Medium", "High"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </label>

                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text text-sm font-medium">Physical Activity (h/week)</span>
                    <span className="label-text-alt text-base-content/40">current: {result.input.Physical_Activity}</span>
                  </div>
                  <input type="number" name="Physical_Activity" value={simForm.Physical_Activity}
                    onChange={handleChange} className="input input-bordered" min={0} max={30} />
                </label>

                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text text-sm font-medium">Parental Involvement</span>
                    <span className="label-text-alt text-base-content/40">current: {result.input.Parental_Involvement}</span>
                  </div>
                  <select name="Parental_Involvement" value={simForm.Parental_Involvement}
                    onChange={handleChange} className="select select-bordered">
                    {["Low", "Medium", "High"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </label>

                <label className="form-control">
                  <div className="label pb-1">
                    <span className="label-text text-sm font-medium">Extracurricular Activities</span>
                    <span className="label-text-alt text-base-content/40">current: {result.input.Extracurricular_Activities}</span>
                  </div>
                  <select name="Extracurricular_Activities" value={simForm.Extracurricular_Activities}
                    onChange={handleChange} className="select select-bordered">
                    {["Yes", "No"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </label>

              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <button className="btn btn-primary" onClick={handleSimulate} disabled={simLoading}>
                  {simLoading
                    ? <span className="loading loading-spinner loading-sm" />
                    : "Run Simulation 🔮"}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setSimForm(result.input); setSimScore(null) }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Hasil Simulasi (1/3 lebar) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          
          {/* Baseline */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body items-center text-center py-5">
              <div className="text-xs text-base-content/50 uppercase tracking-wider">Baseline Score</div>
              <div className="text-3xl font-extrabold mt-1">{baselineScore?.toFixed(1)}</div>
            </div>
          </div>

          {/* Simulated Result */}
          {simScore !== null && (
            <div className={`card shadow-md ${diff >= 0 ? 'bg-success/10 border border-success/30' : 'bg-error/10 border border-error/30'}`}>
              <div className="card-body items-center text-center py-5 gap-2">
                <div className="text-xs uppercase tracking-wider opacity-70">Simulated Score</div>
                <div className="text-4xl font-extrabold">{simScore.toFixed(1)}</div>
                <div className={`badge badge-lg font-bold ${diff >= 0 ? 'badge-success' : 'badge-error'}`}>
                  {diff >= 0 ? "+" : ""}{diff.toFixed(2)} pts
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          {/* Info card jika belum disimulasikan */}
          {simScore === null && !error && (
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body items-center text-center py-10">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm text-base-content/50">Adjust parameters and click <strong>Run Simulation</strong> to see the impact.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}