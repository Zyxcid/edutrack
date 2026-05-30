import { useState } from "react";
import { useNavigate } from 'react-router-dom'

// ── Icons ──────────────────────────────────────────────────────────────────
const IconBrain = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);
const IconChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);
const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
  </svg>
);
const IconSparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);
const IconBeaker = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
);
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);
const IconMenuBar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
  </svg>
);

// ── Data ───────────────────────────────────────────────────────────────────
const features = [
  { icon: <IconChart />, title: "Prediksi Skor Akademik", desc: "Gunakan machine learning untuk memprediksi performa siswa secara akurat dan mengenali kemungkinan hasil akademik sejak dini." },
  { icon: <IconShield />, title: "Klasifikasi Risiko", desc: "Identifikasi siswa berisiko secara otomatis dengan analitik canggih dan dukung intervensi lebih cepat." },
  { icon: <IconSparkles />, title: "Rekomendasi AI", desc: "Dapatkan rekomendasi belajar yang dipersonalisasi sesuai kebutuhan dan gaya belajar setiap siswa." },
  { icon: <IconBeaker />, title: "Simulasi What-If", desc: "Jalankan skenario hipotetik untuk melihat bagaimana variabel berbeda mempengaruhi performa akademik." },
  { icon: <IconChart />, title: "Dashboard Analitik", desc: "Visualisasi data pendidikan yang lengkap untuk diubah menjadi wawasan nyata dan mudah dipahami." },
  { icon: <IconUsers />, title: "Kolaborasi Tim", desc: "Dukung kolaborasi antara guru, administrator, dan siswa dengan wawasan yang transparan dan mudah dibagikan." },
];

const steps = [
  { num: "1", title: "Input Profil", desc: "Isi data kebiasaan dan riwayat akademik siswa." },
  { num: "2", title: "Analisis AI", desc: "Algoritme machine learning kami menganalisis pola dan memprediksi skor." },
  { num: "3", title: "Dapatkan Wawasan", desc: "Akses dashboard komprehensif dengan rekomendasi personalisasi dan strategi intervensi untuk hasil yang lebih baik." },
];

const navLinks = ["Fitur", "Cara Kerja", "Dashboard", "Tentang"];

const footerLinks = {
  Produk: ["Fitur", "Harga", "API", "Integrasi"],
  Perusahaan: ["Tentang", "Blog", "Karir", "Kontak"],
  Dukungan: ["Pusat Bantuan", "Dokumentasi", "Status", "Keamanan"],
};

// ── Components ─────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur border-b border-base-200">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="/" className="text-xl font-extrabold tracking-tight text-primary">EduTrack AI</a>

        {/* Desktop nav links */}
        <ul className="hidden lg:flex gap-1">
          {navLinks.map(link => (
            <li key={link}>
              <a href={`#${link.toLowerCase().replace(/ /g, "-")}`} className="btn btn-ghost btn-sm">{link}</a>
            </li>
          ))}
        </ul>

        {/* Mobile menu toggle */}
        <button
          className="btn btn-ghost btn-square lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <IconMenuBar />
        </button>

        {/* Desktop auth buttons */}
        <div className="hidden sm:flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/signin')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </div>

      {/* Mobile nav links */}
      {open && (
        <div className="lg:hidden bg-base-100 border-t border-base-200">
          <ul className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map(link => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase().replace(/ /g, "-")}`}
                  className="block rounded-lg px-3 py-2 text-sm text-base-content hover:bg-base-200"
                  onClick={() => setOpen(false)}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const navigate = useNavigate()
  return (
    <section id="hero" className="min-h-[90vh] flex items-center bg-linear-to-br from-base-100 to-base-200">
      <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Teks kiri */}
        <div className="flex flex-col gap-6">
          <div className="badge badge-primary badge-outline font-semibold">Platform Berbasis AI</div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Analisis Performa Akademik Anda dengan <span className="text-primary">AI</span>
          </h1>
          <p className="text-base-content/70 text-lg leading-relaxed">
            Ubah hasil pendidikan dengan wawasan dari machine learning. Prediksi performa siswa, identifikasi risiko, dan berikan rekomendasi yang dipersonalisasi untuk kesuksesan akademik.
          </p>
        </div>

        {/* Placeholder gambar kanan */}
        <div className="flex justify-center">
          <div className="w-full max-w-md aspect-square rounded-3xl bg-base-300 flex items-center justify-center shadow-xl">
            <span className="text-base-content/30 text-sm"><img src="analyticspreview.png" alt="Pratinjau analitik" /></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="fitur" className="py-24 bg-base-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Fitur Unggulan</h2>
          <p className="text-base-content/60 max-w-xl mx-auto">
            Platform AI kami memberikan wawasan lengkap dan alat untuk meningkatkan hasil pembelajaran dan keberhasilan siswa.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="card bg-base-200 hover:shadow-lg transition-shadow duration-200">
              <div className="card-body gap-4">
                <div className="text-primary">{icon}</div>
                <h3 className="card-title text-base">{title}</h3>
                <p className="text-base-content/60 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="py-24 bg-base-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Cara Kerja EduTrack AI</h2>
          <p className="text-base-content/60 max-w-xl mx-auto">
            Proses tiga langkah kami mengubah data pendidikan mentah menjadi wawasan yang dapat ditindaklanjuti untuk mendorong kesuksesan akademik.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-extrabold shadow">
                {num}
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-base-content/60 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreviewSection() {
  const navigate = useNavigate()
  return (
    <section id="dashboard" className="py-24 bg-base-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Coba Dashboard</h2>
          <p className="text-base-content/60 max-w-xl mx-auto">
            Lihat tampilan panel Overview dan Simulasi What-If yang membantu siswa dan pendidik mengambil keputusan berdasarkan data.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card bg-base-200 shadow-xl overflow-hidden">
            <div className="card-body p-6">
              <div className="font-bold text-lg mb-3">Dashboard Overview</div>
              <div className="rounded-3xl overflow-hidden border border-base-300">
                <img src="/overview-screenshot.jpg" alt="Screenshot Dashboard Overview" className="w-full object-cover" />
              </div>
              <p className="text-sm text-base-content/60 mt-4">
                Ringkasan kinerja, skor prediksi, tren, dan rekomendasi AI untuk membantu siswa memahami kemajuan mereka.
              </p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl overflow-hidden">
            <div className="card-body p-6">
              <div className="font-bold text-lg mb-3">Simulasi What-If</div>
              <div className="rounded-3xl overflow-hidden border border-base-300">
                <img src="/whatif-screenshot.jpg" alt="Screenshot Simulasi What-If" className="w-full object-cover" />
              </div>
              <p className="text-sm text-base-content/60 mt-4">
                Simulasikan perubahan parameter belajar untuk melihat dampaknya terhadap skor akademik secara instan.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function CTASection() {
  const navigate = useNavigate() 
  return (
    <section className="py-24 bg-primary text-primary-content">
      <div className="max-w-2xl mx-auto px-6 text-center flex flex-col gap-6">
        <h2 className="text-3xl lg:text-4xl font-extrabold">Siap Mengubah Pendidikan dengan AI?</h2>
        <p className="opacity-80 text-lg">
          Bergabunglah dengan pendidik yang sudah menggunakan EduTrack AI untuk meningkatkan hasil siswa dan mencapai kesuksesan akademik.
        </p>
        <button className="btn bg-white text-primary hover:bg-white/80 border-none" onClick={() => navigate('/signin')}>Mulai Sekarang</button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="tentang" className="bg-base-200 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <span className="text-xl font-extrabold text-primary">EduTrack AI</span>
            <p className="text-sm text-base-content/60 leading-relaxed">
              Memberdayakan pendidik dengan wawasan berbasis AI untuk mengubah hasil akademik dan kesuksesan siswa.
            </p>
          </div>
          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <div className="font-bold mb-4 text-sm">{group}</div>
              <ul className="flex flex-col gap-2">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-base-content/60 hover:text-primary transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-base-300 pt-6 text-center text-sm text-base-content/40">
          © 2026 EduTrack AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DashboardPreviewSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
