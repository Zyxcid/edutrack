import { Routes, Route, Navigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Overview from "./dashboard/Overview"
import WhatIf from "./dashboard/WhatIf"
import Profile from "./dashboard/Profile"

export default function DashboardPage() {
  return (
    <Navbar>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="whatif" element={<WhatIf />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Navbar>
  )
}
