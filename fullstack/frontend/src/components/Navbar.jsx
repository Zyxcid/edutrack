import { useNavigate, useLocation } from "react-router-dom"

// ── Icons ──────────────────────────────────────────────────────────────────
const IconOverview = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="inline-block size-4">
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </svg>
)
const IconBeaker = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="inline-block size-4">
    <path d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/>
  </svg>
)
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="inline-block size-4">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="inline-block size-4">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="inline-block size-5">
    <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/><path d="M9 4v16"/><path d="M14 10l2 2l-2 2"/>
  </svg>
)

// ── Menu Config ────────────────────────────────────────────────────────────
const menuItems = [
  { label: "Overview", icon: <IconOverview />, path: "/dashboard" },
  { label: "What-If", icon: <IconBeaker />, path: "/dashboard/whatif" },
  { label: "Profil", icon: <IconUser />, path: "/dashboard/profile" },
]

// ── Sidebar Content ────────────────────────────────────────────────────────
function SidebarContent({ onNavigate }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('predictionResult')
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-full bg-base-200 w-64">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-base-300">
        <span className="text-xl font-extrabold text-primary">EduTrack</span>
      </div>

      {/* Menu */}
      <ul className="menu w-full grow px-2 py-4 gap-1">
        <li className="menu-title text-xs uppercase tracking-widest opacity-50 px-2 mb-1">Analitik</li>
        {menuItems.map(({ label, icon, path }) => (
          <li key={label}>
            <button
              onClick={() => { navigate(path); if (onNavigate) onNavigate(); }}
              className={location.pathname === path ? "active" : ""}
            >
              {icon}
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div className="p-4 border-t border-base-300">
        <button onClick={handleLogout} className="btn btn-ghost btn-sm w-full justify-start gap-2 text-error">
          <IconLogout /> Keluar
        </button>
      </div>
    </div>
  )
}

// ── Main Navbar Component ──────────────────────────────────────────────────
function Navbar({ children }) {
  const location = useLocation()
  const activeMenu = menuItems.find(m => m.path === location.pathname)

  return (
    <div className="drawer lg:drawer-open h-screen">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main Content */}
      <div className="drawer-content flex flex-col flex-1 min-h-screen overflow-auto">
        {/* Topbar */}
        <nav className="navbar w-full bg-base-100 border-b border-base-200 sticky top-0 z-10">
          {/* Hamburger - mobile only */}
          <label htmlFor="my-drawer" className="btn btn-square btn-ghost lg:hidden">
            <IconMenu />
          </label>
          {/* Title */}
          <div className="flex-1 px-4 font-semibold">
            {activeMenu?.label ?? "Dasbor"}
          </div>
          {/* User info */}
          <div className="px-4">
            <span className="text-sm text-base-content/50">
              {JSON.parse(localStorage.getItem('user') ?? '{}')?.name ?? ''}
            </span>
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-20">
        <label htmlFor="my-drawer" className="drawer-overlay" />
        <SidebarContent onNavigate={() => document.getElementById('my-drawer').checked = false} />
      </div>
    </div>
  )
}

export default Navbar