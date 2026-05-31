import { Link } from "wouter";
import { useBusiness } from "@/lib/business-context";
import { useMembership } from "@/lib/membership-context";
import { usePersona } from "@/lib/persona";
import { LivCommandHub } from "@/components/liv/liv-command-hub";
import { PayrollExportCard } from "@/components/payroll-export-card";
import { EnterpriseExportCard } from "@/components/enterprise-export-card";
import { PersonaRitualHeader } from "@/components/ritual/persona-ritual-header";
import { PageFrame } from "@/components/ui/page-frame";
import { SettingsDisclosure } from "@/components/ui/settings-disclosure";
import { ChevronRight, Sparkles } from "lucide-react";
import {
  showEnterpriseToolkitExports,
  showPayrollToolkitExport,
} from "@workspace/policy";

const LIV_LINKS = [
  { href: "/settings?tab=liv", label: "Liv voice & prompts" },
  { href: "/settings?tab=policy", label: "Booking policy" },
  { href: "/settings?tab=comms", label: "Channels" },
] as const;

/** Org-admin/owner Liv command centre — deferred exports and settings links. */
export default function ToolkitPage() {
  const { business } = useBusiness();
  const { effectiveRole } = useMembership();
  const { kind: persona } = usePersona();
  const showExports = persona === "org_admin" || effectiveRole === "OWNER";
  const vertical = (business as { vertical?: string } | null)?.vertical;
  const tier = (business as { tier?: string } | null)?.tier;
  const showPayroll = showExports && showPayrollToolkitExport(vertical, tier);
  const showEnterprise = showExports && showEnterpriseToolkitExports(vertical, tier);

  return (
    <PageFrame width="md" className="space-y-4" data-testid="toolkit-page">
      <PersonaRitualHeader
        variant="page"
        title="Liv command"
        subtitle="Briefing and tuning — day-to-day work stays on Today and Queue."
      />

      <LivCommandHub density="focused" />

      {showPayroll || showEnterprise ? (
        <SettingsDisclosure
          title="Exports"
          description="Payroll and enterprise reports when your plan includes them."
          defaultOpen={false}
        >
          <div className="space-y-3 pt-1">
            {showPayroll ? <PayrollExportCard /> : null}
            {showEnterprise ? <EnterpriseExportCard /> : null}
          </div>
        </SettingsDisclosure>
      ) : null}

      <SettingsDisclosure
        title="Liv & trust settings"
        description="Voice, policy, and channels."
        defaultOpen={false}
      >
        <ul className="divide-y divide-border/60 pt-1">
          {LIV_LINKS.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="flex items-center justify-between gap-2 py-2.5 text-sm hover:text-primary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
                  {t.label}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </SettingsDisclosure>

      {business?.slug ? (
        <p className="text-[11px] text-muted-foreground text-center">
          Customer-facing Liv:{" "}
          <a
            className="text-primary hover:underline font-mono"
            href={`/b/${business.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            /b/{business.slug}
          </a>
        </p>
      ) : null}
    </PageFrame>
  );
}
