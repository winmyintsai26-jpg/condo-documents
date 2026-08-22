import { hash } from "bcryptjs";
import { stdin, stdout } from "node:process";
if (!stdin.isTTY) { console.error("Run this command in an interactive terminal."); process.exit(1); }
stdout.write("Enter the new admin password: "); stdin.setRawMode(true); stdin.resume(); stdin.setEncoding("utf8"); let password = "";
stdin.on("data", async key => { if (key === "\u0003") process.exit(130); if (key === "\r" || key === "\n") { stdin.setRawMode(false); stdout.write("\n"); if (password.length < 12) { console.error("Password must be at least 12 characters."); process.exit(1); } console.log(await hash(password, 12)); process.exit(0); } if (key === "\u007f") password = password.slice(0, -1); else password += key; });
