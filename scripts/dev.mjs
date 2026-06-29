import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import os from "node:os";

const port = process.env.PORT ?? "3000";

function getLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    if (name === "lo" || name.startsWith("tailscale") || name.startsWith("docker")) {
      continue;
    }
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

function getTailscaleIp() {
  try {
    return execSync("tailscale ip -4", { encoding: "utf8" }).trim() || null;
  } catch {
    return null;
  }
}

const origins = [
  ...new Set(
    [
      getLanIp(),
      getTailscaleIp(),
      ...(process.env.ALLOWED_DEV_ORIGINS_EXTRA?.split(",")
        .map((value) => value.trim())
        .filter(Boolean) ?? []),
    ].filter(Boolean),
  ),
];

if (origins.length > 0) {
  process.env.ALLOWED_DEV_ORIGINS = origins.join(",");
}

const tailscaleIp = getTailscaleIp();
const lanIp = getLanIp();

console.log("\n  Probe dev server\n");
console.log(`  Local:     http://localhost:${port}`);
if (lanIp) console.log(`  LAN:       http://${lanIp}:${port}`);
if (tailscaleIp) console.log(`  Tailscale: http://${tailscaleIp}:${port}`);
console.log("");

const child = spawn(
  "pnpm",
  ["exec", "next", "dev", "-H", "0.0.0.0", "-p", port],
  { stdio: "inherit", env: process.env },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
