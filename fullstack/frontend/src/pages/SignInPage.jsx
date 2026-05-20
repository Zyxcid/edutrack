import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { register, login } from "../services/api";

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSignIn, setIsSignIn] = useState(location.pathname === '/signin')
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError("")

    // ── Validasi Frontend ──
    if (isSignIn) {
      if (!form.email || !form.password) {
        setError("Email and password are required")
        return
      }
    } else {
      if (!form.name || !form.email || !form.password || !form.confirm) {
        setError("All fields are required")
        return
      }
      if (form.name.trim().length < 2) {
        setError("Name must be at least 2 characters")
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email)) {
        setError("Invalid email format")
        return
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters")
        return
      }
      if (form.password !== form.confirm) {
        setError("Passwords do not match")
        return
      }
    }

    setLoading(true)

    try {
      if (isSignIn) {
        const res = await login({ email: form.email, password: form.password })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        navigate('/dashboard')
      } else {
        await register({ name: form.name, email: form.email, password: form.password })
        setIsSignIn(true)
        setForm({ name: "", email: "", password: "", confirm: "" })
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Kiri: Branding Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary text-primary-content p-12">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="text-2xl font-extrabold tracking-tight">
          EduTrack
        </button>

        {/* Tengah */}
        <div className="flex flex-col gap-6">
          <div className="text-4xl font-extrabold leading-snug">
            Transform Education <br /> with AI Insights
          </div>
          <p className="opacity-75 text-lg leading-relaxed max-w-sm">
            Predict student performance, identify at-risk learners, and deliver personalized recommendations.
          </p>

          {/* Stats */}
          <div className="flex gap-10 pt-4">
            {[["95%", "Accuracy"], ["10K+", "Students"], ["300+", "Institutions"]].map(([val, label]) => (
              <div key={label}>
                <div className="text-3xl font-extrabold">{val}</div>
                <div className="text-sm opacity-60">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bawah */}
        <div className="text-sm opacity-50">© 2026 EduTrack AI. All rights reserved.</div>
      </div>

      {/* ── Kanan: Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-base-100">

        {/* Mobile logo */}
        <button onClick={() => navigate("/")} className="lg:hidden text-xl font-extrabold text-primary mb-8">
          EduTrack
        </button>

        <div className="w-full max-w-sm flex flex-col gap-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-extrabold">
              {isSignIn ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-base-content/50 text-sm mt-1">
              {isSignIn
                ? "Sign in to your EduTrack account"
                : "Start your journey with EduTrack AI"}
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">

            {/* Name — hanya Register */}
            {!isSignIn && (
              <label className="form-control">
                <div className="label pb-1">
                  <span className="label-text text-sm font-medium">Full Name</span>
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  className="input input-bordered w-full"
                  value={form.name}
                  onChange={handleChange}
                />
              </label>
            )}

            {/* Email */}
            <label className="form-control">
              <div className="label pb-1">
                <span className="label-text text-sm font-medium">Email</span>
              </div>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            {/* Password */}
            <label className="form-control">
              <div className="label pb-1">
                <span className="label-text text-sm font-medium">Password</span>
                {isSignIn && (
                  <a href="#" className="label-text-alt text-primary hover:underline">Forgot password?</a>
                )}
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={form.password}
                onChange={handleChange}
              />
            </label>

            {/* Confirm Password — hanya Register */}
            {!isSignIn && (
              <label className="form-control">
                <div className="label pb-1">
                  <span className="label-text text-sm font-medium">Confirm Password</span>
                </div>
                <input
                  type="password"
                  name="confirm"
                  placeholder="••••••••"
                  className="input input-bordered w-full"
                  value={form.confirm}
                  onChange={handleChange}
                />
              </label>
            )}

            {error && (
              <div className="alert alert-error text-sm py-2">
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
             <button
              className="btn btn-primary w-full mt-2"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : isSignIn ? "Sign In" : "Create Account"}
            </button>
          </div>

          {/* Toggle Sign In / Register */}
          <p className="text-center text-sm text-base-content/50">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="text-primary font-semibold hover:underline"
              onClick={() => setIsSignIn(!isSignIn)}
            >
              {isSignIn ? "Get Started" : "Sign In"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
