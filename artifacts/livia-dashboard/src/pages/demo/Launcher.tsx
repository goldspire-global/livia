import { Link } from "wouter";
import {
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Sun,
  Leaf,
  Headphones,
  Heart,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { PERSONAS, ACCENT_CLASSES, type Persona } from "@/lib/demo/personas";

const ICONS: Record<Persona["iconName"], LucideIcon> = {
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Sun,
  Leaf,
  Headphones,
  Heart,
};

export default function DemoLauncher() {
  return (
    <div className="min-h-[100dvh] bg-[#09090b] text-white relative overflow-x-hidden">
      {/* Aurora ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#8b5cf6]/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#06b6d4]/12 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#10b981]/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        {/* Header */}
        <header className="mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] font-mono tracking-wide text-[#22d3ee] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse" />
            Livia · the demo gateway
          </div>
          <h1
            className="text-4xl md:text-6xl tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: "var(--app-font-serif)" }}
          >
            Same building.
            <span className="block text-white/50 italic">A different ritual at every door.</span>
          </h1>
          <p className="text-base md:text-lg text-white/60 max-w-2xl leading-relaxed">
            Livia is one product, but it doesn't feel like one product. The founder's
            morning glance, the senior stylist's lock-screen countdown, the front-desk
            wall, the customer's wallet pass — same data, seven rituals. Pick a door.
          </p>
        </header>

        {/* Persona grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="demo-launcher-grid"
        >
          {PERSONAS.map((p) => {
            const Icon = ICONS[p.iconName];
            const a = ACCENT_CLASSES[p.accent];
            return (
              <Link key={p.id} href={`/demo/${p.id}`}>
                <article
                  className={`group relative h-full rounded-2xl border ${a.border} bg-gradient-to-br ${a.gradFrom} ${a.gradTo} p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl overflow-hidden`}
                  data-testid={`demo-launcher-card-${p.id}`}
                >
                  <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full ${a.bg} blur-3xl opacity-60 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${a.border} ${a.bg} mb-5`}>
                      <Icon className={`h-5 w-5 ${a.text}`} />
                    </div>
                    <h2
                      className="text-xl mb-1 tracking-tight"
                      style={{ fontFamily: "var(--app-font-serif)" }}
                    >
                      {p.displayName}
                    </h2>
                    <p className="text-[11px] uppercase tracking-wider font-mono text-white/40 mb-4">
                      {p.roleLabel} · {p.businessName.split("·")[0].trim()}
                    </p>
                    <p className="text-sm text-white/70 leading-relaxed mb-8">{p.tease}</p>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${a.text}`}>
                      Step inside
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Footer note */}
        <footer className="mt-16 pt-8 border-t border-white/5 text-[11px] font-mono text-white/40 max-w-3xl">
          <p>
            All seven rooms share the same Livia engine. The data is mocked for the
            showcase, but the rituals are how the product is actually built. The full
            architecture lives in <span className="text-white/60">docs/personas.md</span> and
            <span className="text-white/60"> docs/demo-gateway.md</span>.
          </p>
        </footer>
      </div>
    </div>
  );
}
