import { useLocation } from "wouter";
import logoUrl from "@assets/briefly_logo_transparent.png";
import { ArrowRight, Upload, Settings2, Zap, Globe, GitBranch, Mail, FileText, MessageSquare } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Upload your memo",
    body: "Drag in a PDF or DOCX, or paste the text directly. Briefly extracts and prepares the content automatically.",
  },
  {
    step: "02",
    title: "Set the context",
    body: "Who's reading this? What decision do they need to make? Two fields guide the AI to focus on what matters.",
  },
  {
    step: "03",
    title: "Get your brief",
    body: "Seconds later, you have a plain-English summary tailored to your audience — ready to copy, share, or reference.",
  },
];

const FEATURES = [
  {
    icon: Upload,
    title: "Upload anything.",
    body: "PDF, DOCX, or paste directly. Briefly reads your memo — however it arrives.",
  },
  {
    icon: Settings2,
    title: "Set the context.",
    body: "Who's reading this? What do they need to decide? Two fields. That's it.",
  },
  {
    icon: Zap,
    title: "Get your brief.",
    body: "AI that understands business goals, not just legal language. Distilled in seconds.",
  },
];

const FORMATS = [
  { icon: Mail, label: "Short email", desc: "Under 250 words. Bottom line up front." },
  { icon: FileText, label: "One-pager", desc: "Structured sections. Decision-ready." },
  { icon: MessageSquare, label: "Slack bullets", desc: "30-second reads. Built for async." },
  { icon: Globe, label: "World map", desc: "Jurisdictions at a glance." },
  { icon: GitBranch, label: "Flowchart", desc: "Processes and decisions, visualised." },
];

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827]" style={{ fontFamily: "Inter, sans-serif" }}>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={logoUrl} alt="Briefly" className="h-7" />
          <button
            onClick={() => setLocation("/new")}
            className="flex items-center gap-2 bg-[#111827] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1f2937] transition-colors"
            data-testid="nav-open-app"
          >
            Open app <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      <section className="bg-[#111827] text-white">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-white/15">
            <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full inline-block" />
            Legal communication, simplified
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-white"
            style={{ fontFamily: "Merriweather, serif" }}
          >
            Legal advice.<br />
            <span className="text-[#3B82F6]">Translated.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12">
            Briefly transforms dense legal memos into clear, action-oriented summaries your business team can actually read — and act on.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setLocation("/new")}
              className="flex items-center gap-2 bg-[#3B82F6] text-white font-semibold px-6 py-3.5 rounded-lg hover:bg-[#2563EB] transition-colors text-base"
              data-testid="hero-cta"
            >
              Start your first brief <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="text-white/55 hover:text-white text-base transition-colors font-medium"
            >
              See how it works ↓
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#111827]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-t-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="h-9 bg-[#F3F4F6] border-b border-gray-200 flex items-center px-4 gap-1.5">
              <span className="w-3 h-3 bg-[#FC8181] rounded-full" />
              <span className="w-3 h-3 bg-[#F6C05C] rounded-full" />
              <span className="w-3 h-3 bg-[#68D391] rounded-full" />
              <span className="ml-4 text-xs text-gray-400 font-mono select-none">briefly.app/memo/42</span>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-8 bg-[#F9FAFB] min-h-[220px]">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Source memo</div>
                <div className="space-y-2.5">
                  {[100, 92, 85, 100, 70, 55, 78, 90, 45].map((w, i) => (
                    <div key={i} className="h-2 bg-gray-200 rounded-full" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] mb-4">Your brief</div>
                <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-[#3B82F6] rounded-md flex-shrink-0" />
                    <div className="h-2.5 bg-[#111827] rounded-full w-32" />
                  </div>
                  <div className="space-y-2 mb-5">
                    {[90, 100, 68].map((w, i) => (
                      <div key={i} className="h-2.5 bg-[#111827] rounded-full opacity-80" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <div className="border-l-2 border-[#3B82F6] pl-3 space-y-2">
                    {[78, 95, 62, 84].map((w, i) => (
                      <div key={i} className="h-2 bg-gray-300 rounded-full" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#3B82F6] text-sm font-semibold uppercase tracking-widest mb-4">How it works</p>
            <h2
              className="text-4xl font-bold text-[#111827]"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              Three steps. No workflow change.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {STEPS.map(({ step, title, body }) => (
              <div key={step}>
                <div
                  className="text-7xl font-bold text-[#E5E7EB] mb-4 leading-none"
                  style={{ fontFamily: "Merriweather, serif" }}
                >
                  {step}
                </div>
                <h3
                  className="text-xl font-bold text-[#111827] mb-3"
                  style={{ fontFamily: "Merriweather, serif" }}
                >
                  {title}
                </h3>
                <p className="text-[#6B7280] leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#3B82F6] text-sm font-semibold uppercase tracking-widest mb-4">Features</p>
            <h2
              className="text-4xl font-bold text-[#111827]"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              Built for the way legal teams actually work.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-[#E5E7EB] p-7 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 bg-[#EFF6FF] rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <h3
                  className="text-lg font-bold text-[#111827] mb-2"
                  style={{ fontFamily: "Merriweather, serif" }}
                >
                  {title}
                </h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#3B82F6] text-sm font-semibold uppercase tracking-widest mb-4">Output formats</p>
            <h2
              className="text-4xl font-bold text-[#111827] mb-4"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              One memo. Five ways to communicate it.
            </h2>
            <p className="text-[#6B7280] max-w-xl mx-auto text-sm leading-relaxed">
              Choose the format that fits your audience — from a 30-second Slack update to a full one-pager or a jurisdictional world map.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {FORMATS.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="group rounded-xl border border-[#E5E7EB] p-5 text-center hover:border-[#3B82F6] hover:bg-[#F0F7FF] transition-all cursor-default"
              >
                <div className="w-11 h-11 bg-[#F9FAFB] group-hover:bg-white rounded-xl flex items-center justify-center mx-auto mb-3 border border-[#E5E7EB] group-hover:border-[#BFDBFE] transition-all">
                  <Icon className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#3B82F6] transition-colors" />
                </div>
                <div className="font-semibold text-sm text-[#111827] mb-1">{label}</div>
                <div className="text-xs text-[#9CA3AF] leading-snug">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 bg-[#111827]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "Merriweather, serif" }}
          >
            Ready to distill your<br />next legal memo?
          </h2>
          <p className="text-white/55 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            No setup. No integration. Upload a memo and walk away with something your team can actually use.
          </p>
          <button
            onClick={() => setLocation("/new")}
            className="inline-flex items-center gap-2.5 bg-[#3B82F6] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#2563EB] transition-colors text-lg"
            data-testid="footer-cta"
          >
            Start your first brief <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="bg-[#111827] border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoUrl} alt="Briefly" className="h-6" />
          <p className="text-white/35 text-sm">Legal communication, simplified.</p>
          <button
            onClick={() => setLocation("/new")}
            className="text-white/35 hover:text-white text-sm transition-colors"
          >
            Open app →
          </button>
        </div>
      </footer>
    </div>
  );
}
