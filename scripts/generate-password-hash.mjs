import { hash } from "bcryptjs";
import { stdin, stdout } from "node:process";
if (!stdin.isTTY) { console.error("Run this command in an interactive terminal."); process.exit(1); }
stdout.write("Enter the new admin password: "); stdin.setRawMode(true); stdin.resume(); stdin.setEncoding("utf8");
let password = ""; let finished = false;
stdin.on("data", async chunk => {
  if (finished) return;
  for (const key of chunk) {
    if (key === "\u0003") process.exit(130);
    if (key === "\r" || key === "\n") {
      finished = true; stdin.setRawMode(false); stdin.pause(); stdout.write("\n");
      if (password.length < 12) { console.error("Password must be at least 12 characters."); process.exit(1); }
      const passwordHash = await hash(password, 12); password = "";
      console.log("Copy this entire line into .env:"); console.log(`ADMIN_PASSWORD_HASH='${passwordHash}'`); process.exit(0);
    }
    if (key === "\u007f" || key === "\b") password = password.slice(0, -1); else password += key;
  }
});
