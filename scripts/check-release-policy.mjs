import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function withoutDescriptions(value) {
  if (Array.isArray(value)) return value.map(withoutDescriptions);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "description")
        .map(([key, item]) => [key, withoutDescriptions(item)]),
    );
  }
  return value;
}

export function changesetBump(markdown) {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return frontmatter?.[1].match(
    /^\s*["']?@hypercerts-org\/lexicon["']?\s*:\s*(patch|minor|major)\s*$/m,
  )?.[1];
}

export function lexiconChangeErrors(path, previous, current, bumps) {
  if (previous && !current && !bumps.includes("major")) {
    return [
      `Removed ${path}: a published Lexicon removal requires a major Changeset.`,
    ];
  }
  const structural =
    !previous ||
    !current ||
    JSON.stringify(withoutDescriptions(JSON.parse(previous))) !==
      JSON.stringify(withoutDescriptions(JSON.parse(current)));
  if (structural && !bumps.includes("minor") && !bumps.includes("major")) {
    return [
      `Structural change to ${path}: use at least a minor Changeset, not a patch.`,
    ];
  }
  return [];
}

export function releasePrErrors(previousVersion, version, changelog, body) {
  const errors = [];
  const [oldMajor, oldMinor] = previousVersion.split(".").map(Number);
  const [major, minor] = version.split(".").map(Number);
  if (major === oldMajor && minor === oldMinor) return errors;

  const section = changelog.match(
    new RegExp(
      `^## ${version.replaceAll(".", "\\.")}\\s*$([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`,
      "m",
    ),
  )?.[1];
  const introduction = section?.split(/^### /m)[0].trim();
  if (!introduction || !/[a-zA-Z]{3}/.test(introduction)) {
    errors.push(
      `Lexicon ${version} needs a human-readable summary immediately below its CHANGELOG.md version heading.`,
    );
  }
  if (
    !/https:\/\/github\.com\/hypercerts-org\/documentation\/pull\/\d+\b/.test(
      body,
    )
  ) {
    errors.push(
      `Lexicon ${version} needs a documentation protocol-note PR linked in the Release PR description.`,
    );
  }
  return errors;
}

function git(...args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}

function changedFiles(base, path) {
  return git(
    "diff",
    "--no-renames",
    "--name-only",
    "-z",
    `${base}...HEAD`,
    "--",
    path,
  )
    .split("\0")
    .filter(Boolean);
}

function atBase(base, path) {
  try {
    return git("show", `${base}:${path}`);
  } catch {
    return null;
  }
}

function main(base) {
  const errors = [];
  const lexicons = changedFiles(base, "lexicons/").filter((path) =>
    path.endsWith(".json"),
  );
  if (lexicons.length) {
    const bumps = changedFiles(base, ".changeset/")
      .filter((path) => path.endsWith(".md") && existsSync(path))
      .map((path) => changesetBump(readFileSync(path, "utf8")))
      .filter(Boolean);

    if (!bumps.length)
      errors.push(
        "Changed Lexicon JSON needs a Changeset for @hypercerts-org/lexicon.",
      );
    for (const path of lexicons) {
      const previous = atBase(base, path);
      const current = existsSync(path) ? readFileSync(path, "utf8") : null;
      errors.push(...lexiconChangeErrors(path, previous, current, bumps));
    }
  }

  if (process.env.GITHUB_HEAD_REF === "changeset-release/main") {
    const previous = JSON.parse(atBase(base, "package.json")).version;
    const version = JSON.parse(readFileSync("package.json", "utf8")).version;
    const body =
      JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"))
        .pull_request?.body || "";
    errors.push(
      ...releasePrErrors(
        previous,
        version,
        readFileSync("CHANGELOG.md", "utf8"),
        body,
      ),
    );
  }

  for (const error of errors) console.error(`::error::${error}`);
  if (errors.length) process.exitCode = 1;
  else console.log("Lexicon release policy check passed.");
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv[2] || "origin/main");
}
