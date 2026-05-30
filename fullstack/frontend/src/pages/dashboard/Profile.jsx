import { useNavigate } from "react-router-dom"

export default function Profile() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') ?? '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('predictionResult')
    navigate('/')
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold">Profil</h1>
        <p className="text-base-content/50 text-sm mt-1">Informasi akun Anda</p>
      </div>

      {/* Profile Card */}
      <div className="card bg-base-100 shadow">
        <div className="card-body gap-6">

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-16">
                <span className="text-2xl font-extrabold">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            </div>
            <div>
              <div className="font-extrabold text-lg">{user?.name ?? "-"}</div>
              <div className="text-base-content/50 text-sm">{user?.email ?? "-"}</div>
            </div>
          </div>

          <div className="divider my-0" />

          {/* Info */}
          <div className="flex flex-col gap-3">
            {[
              { label: "Nama Lengkap", value: user?.name ?? "-" },
              { label: "Email", value: user?.email ?? "-" },
              { label: "ID Akun", value: `#${user?.id ?? "-"}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-base-content/50">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="divider my-0" />

          {/* Actions */}
          <div className="flex gap-3">
            <button className="btn btn-error btn-outline btn-sm" onClick={handleLogout}>
              Keluar
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}
