import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentPrediction } from "../../services/api"

// ── ScoreGauge (TIDAK BERUBAH) ────────────────────────────────────────────
function ScoreGauge({ score }) {
  const clamped = Math.min(100, Math.max(0, score))
  const color = clamped >= 75 ? "text-success" : clamped >= 50 ? "text-warning" : "text-error"
  const badge = clamped >= 75 ? "High" : clamped >= 50 ? "Medium" : "Low"
  const badgeColor = clamped >= 75 ? "badge-success" : clamped >= 50 ? "badge-warning" : "badge-error"
  const progressColor = clamped >= 75 ? "progress-success" : clamped >= 50 ? "progress-warning" : "progress-error"

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className={`text-6xl lg:text-7xl font-extrabold ${color}`}>
        {clamped.toFixed(1)}
      </div>
      <div className="text-base-content/50 text-sm">out of 100</div>
      <div className={`badge ${badgeColor} badge-lg font-semibold`}>
        {badge} Performance
      </div>
      <div className="w-full max-w-xs">
        <progress className={`progress w-full ${progressColor}`} value={clamped} max="100" />
      </div>
    </div>
  )
}

// ── StatCard (TIDAK BERUBAH) ──────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div className="card bg-base-200">
      <div className="card-body py-4 px-5">
        <div className="text-sm text-base-content/50">{label}</div>
        <div className="text-2xl font-extrabold">{value}</div>
        {sub && <div className="text-xs text-base-content/40">{sub}</div>}
      </div>
    </div>
  )
}

// ── RecommendationCard (TIDAK BERUBAH) ────────────────────────────────────
const medals = [
  { label: "Top Recommendation", color: "text-yellow-500", border: "border-yellow-200" },
  { label: "Second Recommendation", color: "text-gray-400", border: "border-gray-200" },
  { label: "Third Recommendation", color: "text-amber-600", border: "border-amber-200" },
]
const icons = ["🥇", "🥈", "🥉"]

function RecommendationsSection({ recommendations, score }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card bg-base-100 shadow h-full">
        <div className="card-body items-center text-center gap-2 justify-center h-full">
          <div className="text-4xl">✨</div>
          <h3 className="font-bold">Excellent Profile!</h3>
          <p className="text-base-content/50 text-sm">
            Your student profile is already optimal. No significant improvements needed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {recommendations.slice(0, 3).map((rec, i) => (
        <div key={i} className={`card border ${medals[i]?.border ?? 'border-base-200'} bg-base-100 shadow`}>
          <div className="card-body gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icons[i]}</span>
              <span className={`font-bold text-sm ${medals[i]?.color}`}>
                {medals[i]?.label}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{rec.description}</p>
            <div className="flex gap-4 flex-wrap">
              <div className="text-sm">
                <span className="text-base-content/50">Impact: </span>
                <span className="font-bold text-success">+{rec.improvement?.toFixed(2)} points</span>
              </div>
              <div className="text-sm">
                <span className="text-base-content/50">New score: </span>
                <span className="font-bold text-primary">{rec.new_score?.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main Component (DIUBAH LAYOUT-NYA) ────────────────────────────────────
export default function Overview() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await getCurrentPrediction()
        setResult(res.data.prediction)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPrediction()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-base-content/50">No prediction this week yet.</p>
        <button className="btn btn-primary" onClick={() => navigate('/predict')}>
          Start Prediction
        </button>
      </div>
    )
  }

  const score = result.predicted_score
  const input = result.input
  const recommendations = result.recommendations ?? []

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Overview</h1>
          <p className="text-base-content/50 text-sm mt-1">
            Week of {new Date(result.week_start).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/predict')}>
          Update This Week
        </button>
      </div>

      {/* GRID UTAMA: 2 kolom di layar lebar (3 kiri, 2 kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* KOLOM KIRI (3/5 lebar layar) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Score Card */}
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center gap-2">
              <h2 className="card-title">Predicted Exam Score</h2>
              <ScoreGauge score={score} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Hours Studied" value={`${input.Hours_Studied}h`} sub="per week" />
            <StatCard label="Attendance" value={`${input.Attendance}%`} sub="class presence" />
            <StatCard label="Previous Score" value={input.Previous_Scores} sub="last exam" />
            <StatCard label="Sleep Hours" value={`${input.Sleep_Hours}h`} sub="per night" />
            <StatCard label="Tutoring Sessions" value={input.Tutoring_Sessions} sub="per month" />
            <StatCard label="Motivation" value={input.Motivation_Level} sub="level" />
          </div>
        </div>

        {/* KOLOM KANAN (2/5 lebar layar) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span>💡</span> AI Recommendations
          </h2>
          <RecommendationsSection recommendations={recommendations} score={score} />
          
          <button className="btn btn-outline btn-sm w-full" onClick={() => navigate('/dashboard/whatif')}>
            Try What-If Simulation →
          </button>
        </div>

      </div>
    </div>
  )
}