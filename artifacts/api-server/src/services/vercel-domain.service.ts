/** Optional Vercel domain attach when platform credentials are configured. */
export async function attachDomainToVercelProject(domain: string): Promise<{
  ok: boolean;
  sslStatus: "pending" | "active" | "failed" | "skipped";
  message: string;
}> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_DASHBOARD_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return {
      ok: true,
      sslStatus: "skipped",
      message: "DNS verified — add this domain in your Vercel dashboard project for TLS.",
    };
  }

  const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains${qs}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: domain }),
  });

  if (res.status === 409) {
    return {
      ok: true,
      sslStatus: "pending",
      message: "Domain already registered — SSL provisioning in progress.",
    };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      sslStatus: "failed",
      message: text || `Vercel domain attach failed (${res.status})`,
    };
  }

  const json = (await res.json()) as { verified?: boolean; verification?: unknown[] };
  const sslStatus = json.verified ? "active" : "pending";
  return {
    ok: true,
    sslStatus,
    message:
      sslStatus === "active"
        ? "Domain verified and SSL active on Livia edge."
        : "Domain attached — SSL certificate provisioning (usually under 15 minutes).",
  };
}

export async function pollVercelDomainSsl(domain: string): Promise<"pending" | "active" | "failed" | null> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_DASHBOARD_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId) return null;

  const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}${qs}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { verified?: boolean };
  return json.verified ? "active" : "pending";
}
