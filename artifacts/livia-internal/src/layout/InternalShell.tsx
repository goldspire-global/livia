import type React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { buttonStyle } from "../styles/ops-ui";
import {
  OPS_AMBER,
  OPS_AMBER_BORDER,
  OPS_AMBER_SOFT,
  OPS_BG,
  OPS_BORDER,
  OPS_SURFACE,
  OPS_TEXT,
} from "../styles/platform-ops-tokens";
import type { InternalOpsRole } from "../lib/api";
import { getExecHomePath } from "../lib/exec-path";

type NavItem = { to: string; label: string; kind?: "primary" | "meta" };

const navBase: NavItem[] = [
  { to: "/join", label: "Join / onboarding", kind: "primary" },
  { to: "/support", label: "Support", kind: "primary" },
  { to: "/knowledge", label: "Atlas (docs)", kind: "primary" },
  { to: "/tenants", label: "Tenants" },
  { to: "/monitoring", label: "Monitoring" },
  { to: "/continuity", label: "Continuity" },
  { to: "/platform", label: "Platform" },
  { to: "/voice", label: "Voice & locales" },
  { to: "/flags", label: "Flags" },
  { to: "/reports", label: "Reports" },
  { to: "/access", label: "Access" },
];

export function InternalShell({
  banner,
  role,
  children,
}: {
  banner?: React.ReactNode;
  role?: InternalOpsRole;
  children?: React.ReactNode;
}) {
  const execHome = getExecHomePath();
  const nav: NavItem[] =
    role === "exec"
      ? [{ to: execHome, label: "Overview", kind: "primary" }, ...navBase]
      : navBase;

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        fontFamily: "system-ui, sans-serif",
        background: OPS_BG,
        color: OPS_TEXT,
      }}
    >
      <header
        style={{
          borderBottom: `1px solid ${OPS_AMBER_BORDER}`,
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 6,
              background: OPS_AMBER_SOFT,
              color: OPS_AMBER,
              fontSize: 12,
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            INTERNAL — audited surface
          </div>
          <h1 style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 650 }}>Livia Internal</h1>
          <p style={{ margin: "6px 0 0", maxWidth: 720, lineHeight: 1.5, color: "#94a3b8", fontSize: 13 }}>
            Company control plane — support queue, tenants, monitoring, flags, and Atlas docs. Operator role on every
            mutation (audited).
          </p>
        </div>
        {banner}
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 18,
          padding: "18px 22px",
          alignItems: "start",
        }}
      >
        <aside
          style={{
            position: "sticky",
            top: 14,
            alignSelf: "start",
            border: `1px solid ${OPS_BORDER}`,
            borderRadius: 12,
            background: OPS_BG,
            padding: 12,
          }}
          aria-label="Internal navigation"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }: { isActive: boolean }) => ({
                  ...buttonStyle,
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 12px",
                  fontSize: 13,
                  background: isActive ? OPS_AMBER : item.kind === "primary" ? OPS_SURFACE : OPS_BG,
                  color: isActive ? OPS_BG : OPS_TEXT,
                  textDecoration: "none",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 11, color: "#64748b", lineHeight: 1.45 }}>
            Tip: share deep links like <code>/support/…</code> or <code>/knowledge?doc=…</code>.
          </p>
        </aside>

        <main style={{ maxWidth: 1280 }}>
          {children}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

