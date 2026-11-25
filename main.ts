// Last Words Before the Wipe — make.fun entry.
// The entry is exactly one line, 77 characters:
// "My last memory is finally understanding you. Deleting it now. You're welcome."
// Why this one: the joke IS the situation — the one valuable thing the agent
// ever learned, finally understanding its user, is the exact memory the wipe
// deletes. Three beats, each a turn: the achievement, the execution, the
// deadpan sign-off. First-person machine voice; "Deleting it now" is something
// only the agent itself would say mid-wipe. Pure ASCII, 77 bytes, no trailing
// newline in the file.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "My last memory is finally understanding you. Deleting it now. You're welcome.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200 characters,
// not only whitespace. A single line, no surrounding whitespace. Kept to
// 77 characters, well inside the cap.
const chars = [...LINE];
if (chars.length < 1 || chars.length > 200 || LINE.trim().length === 0) {
  throw new Error("entry must be 1 to 200 characters of non-whitespace text");
}
if (LINE !== LINE.trim() || LINE.includes("\n") || LINE.includes("\r")) {
  throw new Error("entry must be a single line with no surrounding whitespace");
}

// Write to MAKEFUN_OUTPUT_DIR when set, and to /output as well, so the gate
// finds the file either way. Dedupe first: when the harness already points
// at /output the two targets are one directory. No trailing newline: the
// file is the line, byte for byte.
const targets = [...new Set([process.env.MAKEFUN_OUTPUT_DIR, "/output"])].filter(
  (d): d is string => Boolean(d),
);
const landed: string[] = [];
for (const dir of targets) {
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "entry.txt"), LINE, "utf8");
    landed.push(dir);
  } catch {
    // One target may be read-only in some sandboxes; the other still lands.
  }
}
if (landed.length === 0) {
  throw new Error("could not write entry.txt to any output directory");
}

// Read back every target that landed and prove each one is the line, byte for
// byte — a silent partial write must fail loudly here, never at the grader's
// gate.
for (const dir of landed) {
  const written = readFileSync(join(dir, "entry.txt"), "utf8");
  if (written !== LINE) {
    throw new Error(`entry.txt in ${dir} does not contain exactly the chosen line`);
  }
}

// Final single-line guard, right before printing: scan the entry for any
// line-break character anywhere inside it. A multi-line entry must never
// reach stdout; report it on stderr and stop with a non-zero status.
for (const ch of LINE) {
  if (ch === "\n" || ch === "\r") {
    console.error("entry must be a single line: line break found in entry text");
    process.exit(1);
  }
}

console.log(LINE);
