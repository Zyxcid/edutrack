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
  { icon: <IconChart />, title: "Academic Score Prediction", desc: "Leverage machine learning algorithms to accurately predict student performance and identify potential academic outcomes before they happen." },
  { icon: <IconShield />, title: "Risk Classification", desc: "Automatically identify at-risk students using advanced analytics and provide early intervention strategies to prevent academic failure." },
  { icon: <IconSparkles />, title: "AI Recommendations", desc: "Receive personalized study recommendations and learning paths tailored to each student's unique needs and learning style." },
  { icon: <IconBeaker />, title: "What-If Simulation", desc: "Run hypothetical scenarios to understand how different variables affect academic performance and make data-driven decisions." },
  { icon: <IconChart />, title: "Learning Analytics Dashboard", desc: "Comprehensive visual analytics that transform complex educational data into actionable insights and easy-to-understand reports." },
  { icon: <IconUsers />, title: "Collaborative Insights", desc: "Enable educators, administrators, and students to collaborate effectively with shared insights and transparent progress tracking." },
];

const steps = [
  { num: "1", title: "Data Integration", desc: "Seamlessly connect your existing educational systems and import student data, assignments, and performance metrics." },
  { num: "2", title: "AI Analysis", desc: "Our advanced machine learning algorithms analyze patterns, predict outcomes, and identify at-risk students automatically." },
  { num: "3", title: "Actionable Insights", desc: "Access comprehensive dashboards with personalized recommendations and intervention strategies to improve outcomes." },
];

const navLinks = ["Features", "How It Works", "Dashboard", "About"];

const footerLinks = {
  Product: ["Features", "Pricing", "API", "Integrations"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Support: ["Help Center", "Documentation", "Status", "Security"],
};

// ── Components ─────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur border-b border-base-200">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="text-xl font-extrabold tracking-tight text-primary">EduTrack AI</a>

        {/* Desktop nav links */}
        <ul className="hidden lg:flex gap-1">
          {navLinks.map(link => (
            <li key={link}>
              <a href={`#${link.toLowerCase().replace(/ /g, "-")}`} className="btn btn-ghost btn-sm">{link}</a>
            </li>
          ))}
        </ul>

        {/* Desktop auth buttons */}
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/signin')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const navigate = useNavigate()
  return (
    <section id="features" className="min-h-[90vh] flex items-center bg-linear-to-br from-base-100 to-base-200">
      <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Teks kiri */}
        <div className="flex flex-col gap-6">
          <div className="badge badge-primary badge-outline font-semibold">AI-Powered Platform</div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Analyze Your Academic Performance with <span className="text-primary">AI</span>
          </h1>
          <p className="text-base-content/70 text-lg leading-relaxed">
            Transform educational outcomes with machine learning-powered insights. Predict student performance, identify at-risk learners, and deliver personalized recommendations that drive academic success.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started Free</button>
            <button className="btn btn-outline">See Demo</button>
          </div>
          {/* Stats */}
          <div className="flex gap-8 pt-2">
            <p className="text-sm">No credit card required</p>
            <p className="text-sm">14-day free trial</p>
          </div>
        </div>

        {/* Placeholder gambar kanan */}
        <div className="flex justify-center">
          <div className="w-full max-w-md aspect-square rounded-3xl bg-base-300 flex items-center justify-center shadow-xl">
            <span className="text-base-content/30 text-sm"><img src="analyticspreview.png" alt="Analytics Preview" /></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="how-it-works" className="py-24 bg-base-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Powerful Features for Educational Excellence</h2>
          <p className="text-base-content/60 max-w-xl mx-auto">
            Our AI-powered platform provides comprehensive insights and tools to enhance academic outcomes and student success.
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
    <section id="dashboard" className="py-24 bg-base-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">How EduTrack AI Works</h2>
          <p className="text-base-content/60 max-w-xl mx-auto">
            Our intuitive three-step process transforms raw educational data into actionable insights that drive academic success.
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
  return (
    <section id="about" className="py-24 bg-base-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Experience the Dashboard</h2>
          <p className="text-base-content/60 max-w-xl mx-auto">
            Get a glimpse of our comprehensive analytics platform designed to provide clear insights and drive educational excellence.
          </p>
        </div>
        {/* Placeholder dashboard */}
        <div className="rounded-3xl bg-base-200 shadow-xl overflow-hidden">
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-base-300">
            <div className="w-3 h-3 rounded-full bg-error opacity-60" />
            <div className="w-3 h-3 rounded-full bg-warning opacity-60" />
            <div className="w-3 h-3 rounded-full bg-success opacity-60" />
            <div className="flex-1 mx-4 h-5 rounded bg-base-100 opacity-40" />
          </div>
          {/* Placeholder content */}
          <div className="p-8 grid sm:grid-cols-2 gap-6 min-h-64">
            {[
              { label: "Real-time Analytics", desc: "Monitor student performance with live data updates and trend analysis." },
              { label: "AI Predictions", desc: "Advanced machine learning provides accurate performance forecasts." },
            ].map(({ label, desc }) => (
              <div key={label} className="card bg-base-100">
                <div className="card-body">
                  <div className="text-primary font-bold">{label}</div>
                  <p className="text-sm text-base-content/60">{desc}</p>
                  <div className="mt-4 space-y-2">
                    {[80, 60, 90].map((w, i) => (
                      <div key={i} className="h-2 rounded-full bg-base-300 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
        <h2 className="text-3xl lg:text-4xl font-extrabold">Ready to Transform Education with AI?</h2>
        <p className="opacity-80 text-lg">
          Join thousands of educators who are already using EduTrack AI to improve student outcomes and drive academic success.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="btn bg-white text-primary hover:bg-white/90 border-none" onClick={() => navigate('/signin')}>Get Started Free</button>
          <button className="btn btn-outline border-white text-white hover:bg-white hover:text-primary">Learn More</button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-base-200 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <span className="text-xl font-extrabold text-primary">EduTrack AI</span>
            <p className="text-sm text-base-content/60 leading-relaxed">
              Empowering educators with AI-driven insights to transform academic outcomes and student success.
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
