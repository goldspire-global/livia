#!/usr/bin/env node
/**
 * Run Maestro flows for mobile visual captures.
 * Requires: maestro CLI, Expo app on simulator/device, API + demo provisioned.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "e2e", "visual-captures", "mobile");
const flowsDir = path.join(root, "maestro", "flows");

function resolveJavaHome() {
  if (process.env.JAVA_HOME && fs.existsSync(process.env.JAVA_HOME)) {
    return process.env.JAVA_HOME;
  }
  const pf = process.env["ProgramFiles"] ?? "C:\\Program Files";
  if (process.platform === "win32") {
    try {
      const dirs = fs.readdirSync(path.join(pf, "Microsoft"), { withFileTypes: true });
      const jdk = dirs.find((d) => d.isDirectory() && d.name.startsWith("jdk-"));
      if (jdk) return path.join(pf, "Microsoft", jdk.name);
    } catch {
      /* ignore */
    }
    const studioJbr = path.join(pf, "Android", "Android Studio", "jbr");
    if (fs.existsSync(studioJbr)) return studioJbr;
  }
  return null;
}

function resolveAdbPath() {
  const local = path.join(process.env.LOCALAPPDATA ?? "", "Android", "Sdk", "platform-tools", "adb.exe");
  if (fs.existsSync(local)) return local;
  const onPath = which("adb");
  return onPath && fs.existsSync(onPath) ? onPath : null;
}

function listAndroidDeviceIds(adbPath) {
  if (!adbPath) return [];
  const r = spawnSync(adbPath, ["devices"], { encoding: "utf8", shell: false });
  if (r.status !== 0) return [];
  return (r.stdout ?? "")
    .split(/\r?\n/)
    .filter((line) => /\tdevice\s*$/.test(line) && !line.startsWith("List of devices"))
    .map((line) => line.split("\t")[0])
    .filter(Boolean);
}

function hasAndroidDeviceConnected(adbPath) {
  return listAndroidDeviceIds(adbPath).length > 0;
}

function runAdb(adbPath, args) {
  return spawnSync(adbPath, args, { encoding: "utf8", shell: false });
}

/** Stabilize emulator adb + reverse Metro/API before Maestro (avoids launchApp flake). */
function androidPreflight(adbPath, expoUrl) {
  if (!adbPath || !hasAndroidDeviceConnected(adbPath)) return;

  if (process.env.MAESTRO_ADB_RESET === "1") {
    console.log("Restarting adb server (MAESTRO_ADB_RESET=1)…");
    runAdb(adbPath, ["kill-server"]);
    runAdb(adbPath, ["start-server"]);
  }

  for (const port of [3000, 8083]) {
    const r = runAdb(adbPath, ["reverse", `tcp:${port}`, `tcp:${port}`]);
    if (r.status !== 0) {
      console.warn(`adb reverse tcp:${port} failed: ${(r.stderr ?? r.stdout ?? "").trim()}`);
    }
  }

  const pkg = runAdb(adbPath, ["shell", "pm", "list", "packages", "host.exp.exponent"]);
  if (!(pkg.stdout ?? "").includes("host.exp.exponent")) {
    console.error("Expo Go (host.exp.exponent) not installed on the emulator. Install from Play Store.");
    process.exit(1);
  }

  // Maestro openLink handles cold open; only verify reverse + package here.
}

/** Expo Go: Android `host.exp.exponent` · iOS `host.exp.Exponent` · dev build `io.livia.app` */
function resolveMaestroAppId(adbPath) {
  if (process.env.MAESTRO_APP_ID) return process.env.MAESTRO_APP_ID;
  if (hasAndroidDeviceConnected(adbPath)) return "host.exp.exponent";
  return "io.livia.app";
}

const javaHome = resolveJavaHome();
const adbPath = resolveAdbPath();
const maestroAppId = resolveMaestroAppId(adbPath);
const androidUdid =
  process.env.MAESTRO_UDID ?? listAndroidDeviceIds(adbPath)[0] ?? null;
const env = {
  ...process.env,
  ...(javaHome ? { JAVA_HOME: javaHome } : {}),
  MAESTRO_APP_ID: maestroAppId,
  MAESTRO_EXPO_URL: process.env.MAESTRO_EXPO_URL ?? "exp://127.0.0.1:8083",
  MAESTRO_DEMO_EMAIL: process.env.MAESTRO_DEMO_EMAIL ?? "demo-owner@livia.io",
  MAESTRO_DEMO_PASSWORD: process.env.MAESTRO_DEMO_PASSWORD ?? "LiviaDemo2026!",
  // Windows emulators often need >15s for Maestro's Android driver (default 15000ms).
  MAESTRO_DRIVER_STARTUP_TIMEOUT:
    process.env.MAESTRO_DRIVER_STARTUP_TIMEOUT ?? "120000",
};

/** Order: sign-in base → personas → vertical glance passes */
const defaultFlows = [
  "capture-cold-open-gateway.yaml",
  "capture-owner-tabs.yaml",
  "capture-founder-more.yaml",
  "capture-founder-verticals.yaml",
  "capture-persona-manager.yaml",
  "capture-persona-staff.yaml",
  "capture-persona-receptionist.yaml",
];
const flows = process.env.MAESTRO_FLOWS
  ? process.env.MAESTRO_FLOWS.split(",").map((f) => f.trim()).filter(Boolean)
  : defaultFlows;

function which(cmd) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [cmd], {
    encoding: "utf8",
    shell: true,
  });
  if (r.status !== 0) return null;
  const line = (r.stdout ?? "").trim().split(/\r?\n/)[0];
  return line || null;
}

function resolveMaestroBin() {
  if (process.env.MAESTRO_BIN) return process.env.MAESTRO_BIN;
  const onPath = which("maestro");
  if (onPath) return onPath;
  const home = process.env.USERPROFILE ?? process.env.HOME ?? "";
  const candidates = [
    path.join(home, ".maestro", "maestro", "bin", process.platform === "win32" ? "maestro.bat" : "maestro"),
    path.join(home, ".maestro", "bin", process.platform === "win32" ? "maestro.bat" : "maestro"),
    path.join(process.env.LOCALAPPDATA ?? "", "Maestro", "bin", "maestro.bat"),
    path.join(process.env.ProgramFiles ?? "", "Maestro", "bin", "maestro.bat"),
    "/usr/local/bin/maestro",
    "/opt/homebrew/bin/maestro",
  ].filter(Boolean);
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return null;
}

const maestroBin = resolveMaestroBin();
if (!maestroBin) {
  console.error(
    "Maestro CLI not found. Install: https://maestro.mobile.dev/getting-started/installing-maestro",
  );
  console.error("Or set MAESTRO_BIN to your maestro executable.");
  process.exit(1);
}
console.log(`Using Maestro: ${maestroBin}`);
console.log(
  `MAESTRO_APP_ID: ${maestroAppId}${adbPath ? ` (adb: ${adbPath})` : ""}${androidUdid ? ` · device: ${androidUdid}` : ""}`,
);

const expoUrl = env.MAESTRO_EXPO_URL;
androidPreflight(adbPath, expoUrl);

fs.mkdirSync(outDir, { recursive: true });

for (const flow of flows) {
  const flowPath = path.join(flowsDir, flow);
  if (!fs.existsSync(flowPath)) {
    console.error(`Missing flow: ${flowPath}`);
    process.exit(1);
  }
  // Relative path avoids Windows shell splitting `Personal Projects` in absolute paths.
  const flowArg = path.join("maestro", "flows", flow);
  console.log(`\n▶ maestro test ${flowArg}`);
  // shell: true so Windows .bat inherits env; relative flowArg avoids path-with-spaces split.
  const configArg = path.join("maestro", "config.yaml");
  const maxAttempts = Number(process.env.MAESTRO_ATTEMPTS ?? "3");
  let lastStatus = 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      console.log(`Retry ${attempt}/${maxAttempts} after driver/adb flake…`);
      androidPreflight(adbPath, env.MAESTRO_EXPO_URL);
    }
    const args = ["test", "--config", configArg];
    if (androidUdid) args.push("--udid", androidUdid);
    if (attempt > 1) args.push("--reinstall-driver");
    args.push(flowArg);
    const r = spawnSync(
      maestroBin,
      args,
      {
        cwd: root,
        env,
        stdio: "inherit",
        shell: true,
        windowsHide: true,
      },
    );
    lastStatus = r.status ?? 1;
    if (lastStatus === 0) break;
  }
  if (lastStatus !== 0) {
    console.error(`Flow failed: ${flow}`);
    process.exit(lastStatus);
  }
}

console.log(`\nDone. Screenshots under ${outDir}`);
