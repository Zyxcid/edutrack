import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentPrediction, getPredictions } from "../../services/api"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts"

// ── ScoreGauge ─────────────────────────────────────────────────────────────
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
      <div className="text-base-content/50 text-sm">dari 100</div>
      <div className={`badge ${badgeColor} badge-lg font-semibold`}>
        {badge === 'High' ? 'Performa Tinggi' : badge === 'Medium' ? 'Performa Sedang' : 'Performa Rendah'}
      </div>
      <div className="w-full max-w-xs">
        <progress className={`progress w-full ${progressColor}`} value={clamped} max="100" />
      </div>
    </div>
  )
}

// ── StatCard ───────────────────────────────────────────────────────────────
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

// ── Recommendations ────────────────────────────────────────────────────────
const medals = [
  { label: "Rekomendasi Terbaik", color: "text-yellow-500", border: "border-yellow-200" },
  { label: "Rekomendasi Kedua", color: "text-gray-400", border: "border-gray-200" },
  { label: "Rekomendasi Ketiga", color: "text-amber-600", border: "border-amber-200" },
]
const icons = ["🥇", "🥈", "🥉"]

function RecommendationsSection({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card bg-base-100 shadow h-full">
        <div className="card-body items-center text-center gap-2 justify-center h-full">
          <div className="text-4xl">✨</div>
          <h3 className="font-bold">Profil Telah Optimal!</h3>
          <p className="text-base-content/50 text-sm">
            Profil siswanya sudah baik. Tidak perlu perbaikan besar saat ini.
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
                <span className="text-base-content/50">Dampak: </span>
                <span className="font-bold text-success">+{rec.improvement?.toFixed(2)} poin</span>
              </div>
              <div className="text-sm">
                <span className="text-base-content/50">Skor baru: </span>
                <span className="font-bold text-primary">{rec.new_score?.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-lg p-3 shadow text-sm">
        <div className="font-bold mb-1">{label}</div>
        <div className="text-primary font-extrabold">{payload[0].value.toFixed(1)} / 100</div>
      </div>
    )
  }
  return null
}

// ── Score Badge ────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  if (score >= 75) return <span className="badge badge-success">Tinggi</span>
  if (score >= 50) return <span className="badge badge-warning">Sedang</span>
  return <span className="badge badge-error">Rendah</span>
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Overview() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currentRes, historyRes] = await Promise.all([
          getCurrentPrediction(),
          getPredictions()
        ])
        setResult(currentRes.data.prediction)
        setPredictions(historyRes.data.predictions)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
        <p className="text-base-content/50">Belum ada prediksi untuk minggu ini.</p>
        <button className="btn btn-primary" onClick={() => navigate('/predict')}>
          Mulai Prediksi
        </button>
      </div>
    )
  }

  const score = result.predicted_score
  const input = result.input
  const recommendations = result.recommendations ?? []

  // Chart data — urutkan dari lama ke baru
  const chartData = [...predictions]
    .reverse()
    .map(p => ({
      week: new Date(p.week_start).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
      score: parseFloat(p.predicted_score.toFixed(1))
    }))

  // Summary stats
  const avgScore = predictions.reduce((sum, p) => sum + p.predicted_score, 0) / predictions.length
  const latest = predictions[0]?.predicted_score ?? 0
  const oldest = predictions[predictions.length - 1]?.predicted_score ?? 0
  const trend = latest - oldest

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Overview</h1>
          <p className="text-base-content/50 text-sm mt-1">
            Minggu {new Date(result.week_start).toLocaleDateString('id-ID', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/predict')}>
          Perbarui Minggu Ini
        </button>
      </div>

      {/* GRID UTAMA: 2 kolom di layar lebar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* KOLOM KIRI (3/5) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Score Card */}
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center gap-2">
              <h2 className="card-title">Skor Ujian yang Diprediksi</h2>
              <ScoreGauge score={score} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Jam Belajar" value={`${input.Hours_Studied}h`} sub="per minggu" />
            <StatCard label="Kehadiran" value={`${input.Attendance}%`} sub="kehadiran kelas" />
            <StatCard label="Skor Sebelumnya" value={input.Previous_Scores} sub="ujian terakhir" />
            <StatCard label="Jam Tidur" value={`${input.Sleep_Hours}h`} sub="per malam" />
            <StatCard label="Sesi Bimbingan" value={input.Tutoring_Sessions} sub="per bulan" />
            <StatCard label="Motivasi" value={input.Motivation_Level} sub="tingkat" />
          </div>
        </div>

        {/* KOLOM KANAN (2/5) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span>💡</span> Rekomendasi AI
          </h2>
          <RecommendationsSection recommendations={recommendations} />
          <button className="btn btn-outline btn-sm w-full" onClick={() => navigate('/dashboard/whatif')}>
            Coba Simulasi What-If →
          </button>
        </div>

      </div>

      {/* HISTORY — di bawah grid utama */}
      {predictions.length > 0 && (
        <>
          <div className="divider">Riwayat Perkembangan</div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card bg-base-100 shadow">
              <div className="card-body py-4 px-5">
                <div className="text-sm text-base-content/50">Total Minggu</div>
                <div className="text-2xl font-extrabold">{predictions.length}</div>
              </div>
            </div>
            <div className="card bg-base-100 shadow">
              <div className="card-body py-4 px-5">
                <div className="text-sm text-base-content/50">Rata-rata Skor</div>
                <div className="text-2xl font-extrabold text-primary">{avgScore.toFixed(1)}</div>
              </div>
            </div>
            <div className="card bg-base-100 shadow">
              <div className="card-body py-4 px-5">
                <div className="text-sm text-base-content/50">Tren Keseluruhan</div>
                <div className={`text-2xl font-extrabold ${trend >= 0 ? 'text-success' : 'text-error'}`}>
                  {trend >= 0 ? '+' : ''}{trend.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Chart — hanya kalau lebih dari 1 data */}
          {predictions.length > 1 && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="font-bold mb-2">Tren Skor</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={75} stroke="#22c55e" strokeDasharray="4 4" label={{ value: "Tinggi", fontSize: 11, fill: "#22c55e" }} />
                    <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Sedang", fontSize: 11, fill: "#f59e0b" }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                      dot={{ r: 5, fill: "#6366f1" }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Weekly Cards */}
          <div className="flex flex-col gap-3">
            {predictions.map((p, i) => (
              <div key={p.id} className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold
                      ${i === 0 ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'}`}>
                      W{predictions.length - i}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        Minggu {new Date(p.week_start).toLocaleDateString('id-ID', {
                          month: 'long', day: 'numeric', year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-base-content/40">
                        {i === 0 ? 'Terbaru' : `${i} minggu lalu`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={p.predicted_score} />
                    <div className="text-2xl font-extrabold text-primary">
                      {p.predicted_score.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}