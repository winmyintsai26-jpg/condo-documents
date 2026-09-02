import { compare } from "bcryptjs";
import { stdin, stdout, loadEnvFile } from "node:process";
import { timingSafeEqual } from "node:crypto";
if (!process.argv.includes("--injected")) { try { loadEnvFile(".env"); } catch { console.error("Authentication environment: FAIL"); process.exit(1); } }
const ownerMode = process.argv.includes("--owner");
const configuredUsername = (process.env[ownerMode ? "OWNER_USERNAME" : "ADMIN_USERNAME"] ?? "").trim(); const configuredHash = (process.env[ownerMode ? "OWNER_PASSWORD_HASH" : "ADMIN_PASSWORD_HASH"] ?? "").trim();
const validHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(configuredHash);
if (!stdin.isTTY) { console.error("Run this diagnostic in an interactive terminal."); process.exit(1); }
function equal(left, right) { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); }
function prompt(label, hidden = false) { return new Promise(resolve => { stdout.write(label); let value = ""; if (hidden) stdin.setRawMode(true); stdin.resume(); stdin.setEncoding("utf8"); const onData = chunk => { for (const key of chunk) { if (key === "\u0003") process.exit(130); if (key === "\r" || key === "\n") { stdin.off("data", onData); if (hidden) stdin.setRawMode(false); stdin.pause(); stdout.write("\n"); resolve(value); return; } if (key === "\u007f" || key === "\b") value = value.slice(0, -1); else value += key; } }; stdin.on("data", onData); }); }
const username = (await prompt(`Enter configured ${ownerMode ? "owner" : "admin"} username: `)).trim(); const password = await prompt(`Enter original ${ownerMode ? "owner" : "admin"} password: `, true);
console.log(`Username configuration: ${configuredUsername && equal(username, configuredUsername) ? "PASS" : "FAIL"}`);
console.log(`Password hash format: ${validHash ? "PASS" : "FAIL"}`);
console.log(`Password verification: ${validHash && await compare(password, configuredHash) ? "PASS" : "FAIL"}`);
