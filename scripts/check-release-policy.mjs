import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DOCS_PR =
  /(?:https:\/\/github\.com\/hypercerts-org\/documentation\/pull\/|\bhypercerts-org\/documentation#)\d+\b/;

// Drop description strings (prose) but keep schema properties that happen to
// be named "description", whose values are objects.
export function withoutDescriptions(value) {
  if (Array.isArray(value)) return value.map(withoutDescriptions);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key, item]) => key !== "description" || typeof item !== "string",
        )
        .map(([key, item]) => [key, withoutDescriptions(item)]),
    );
  }
  return value;
}

// Key-order-insensitive serialization, so reordering keys is not a change.
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function changesetBump(markdown) {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return frontmatter?.[1].match(
    /^\s*["']?@hypercerts-org\/lexicon["']?\s*:\s*(patch|minor|major)\s*$/m,
  )?.[1];
}

// Compare two sets of Lexicons keyed by NSID, so a moved file with the same
// `id` is not a removal. Returns the smallest bump the change requires.
export function requiredBump(previous, current) {
  const ids = new Set([...previous.keys(), ...current.keys()]);
  let required = "patch";
  const changes = [];
  for (const id of [...ids].sort()) {
    const before = previous.get(id);
    const after = current.get(id);
    if (!after) {
      changes.push(`removed ${id}`);
      required = "major";
    } else if (
      !before ||
      canonical(withoutDescriptions(before)) !==
        canonical(withoutDescriptions(after))
    ) {
      changes.push(`${before ? "changed" : "added"} ${id}`);
      if (required === "patch") required = "minor";
    }
  }
  return { required, changes };
}

const RANK = { patch: 0, minor: 1, major: 2 };

export function lexiconChangeErrors(previous, current, bumps) {
  const { required, changes } = requiredBump(previous, current);
  const highest = bumps.reduce(
    (top, bump) => (RANK[bump] > RANK[top] ? bump : top),
    "patch",
  );
  if (RANK[highest] >= RANK[required]) return [];
  return [
    `Lexicon schema change (${changes.join(", ")}) requires at least a ${required} Changeset for @hypercerts-org/lexicon, not ${highest}.`,
  ];
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?/);
  if (!match) throw new Error(`Cannot parse version "${version}".`);
  return { core: match.slice(1, 4).map(Number), pre: match[4] };
}

// The kind of release going from `previous` to `version`. Promoting a
// prerelease (1.6.0-beta.2 -> 1.6.0) is classified by the stable version's
// shape, since it is the first stable release of that line.
export function releaseKind(previous, version) {
  const from = parseVersion(previous);
  const to = parseVersion(version);
  const [major, minor, patch] = to.core;
  const same = from.core.every((part, index) => part === to.core[index]);
  if (same && from.pre && !to.pre) {
    if (minor === 0 && patch === 0) return "major";
    return patch === 0 ? "minor" : "patch";
  }
  if (major !== from.core[0]) return "major";
  if (minor !== from.core[1]) return "minor";
  return "patch";
}

export function releasePrErrors(previous, version, body, schemaChange) {
  const errors = [];
  const kind = releaseKind(previous, version);
  if (RANK[kind] < RANK[schemaChange.required]) {
    errors.push(
      `Lexicon ${version} is a ${kind} release, but the Lexicons changed since ${previous} (${schemaChange.changes.join(", ")}). It must be at least ${schemaChange.required}.`,
    );
  }
  if (kind !== "patch" && !DOCS_PR.test(body)) {
    errors.push(
      `Lexicon ${version} is a ${kind} release: link the hypercerts-org/documentation PR with its release note in this PR's description.`,
    );
  }
  return errors;
}

function git(...args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function changedFiles(from, path) {
  return git(
    "diff",
    "--no-renames",
    "--name-only",
    "-z",
    from,
    "HEAD",
    "--",
    path,
  )
    .split("\0")
    .filter(Boolean);
}

function existsAt(ref, path) {
  return git("ls-tree", "--name-only", ref, "--", path).trim() !== "";
}

function parseLexicon(source, label, errors) {
  try {
    return JSON.parse(source);
  } catch (error) {
    errors.push(`Invalid JSON in ${label}: ${error.message}`);
    return null;
  }
}

// Load the Lexicons changed between `from` and HEAD, on each side, by NSID.
function changedLexicons(from, errors) {
  const previous = new Map();
  const current = new Map();
  const paths = changedFiles(from, "lexicons/").filter((path) =>
    path.endsWith(".json"),
  );
  for (const path of paths) {
    if (existsAt(from, path)) {
      const lexicon = parseLexicon(
        git("show", `${from}:${path}`),
        `${from}:${path}`,
        errors,
      );
      if (lexicon) previous.set(lexicon.id ?? path, lexicon);
    }
    if (existsSync(path)) {
      const lexicon = parseLexicon(readFileSync(path, "utf8"), path, errors);
      if (lexicon) current.set(lexicon.id ?? path, lexicon);
    }
  }
  return { paths, previous, current };
}

function main(base) {
  const errors = [];
  git("rev-parse", "--verify", `${base}^{commit}`);
  const mergeBase = git("merge-base", base, "HEAD").trim();

  if (process.env.GITHUB_HEAD_REF === "changeset-release/main") {
    const previous = JSON.parse(
      git("show", `${mergeBase}:package.json`),
    ).version;
    const version = JSON.parse(readFileSync("package.json", "utf8")).version;
    const tag = `v${previous}`;
    if (!git("tag", "--list", tag).trim()) {
      errors.push(
        `Cannot find tag ${tag} for the last release, so the Lexicon changes in this release cannot be checked.`,
      );
    } else {
      const { previous: before, current: after } = changedLexicons(tag, errors);
      const body =
        JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"))
          .pull_request?.body || "";
      errors.push(
        ...releasePrErrors(
          previous,
          version,
          body,
          requiredBump(before, after),
        ),
      );
    }
  } else {
    const { paths, previous, current } = changedLexicons(mergeBase, errors);
    if (paths.length) {
      const bumps = changedFiles(mergeBase, ".changeset/")
        .filter((path) => path.endsWith(".md") && existsSync(path))
        .map((path) => changesetBump(readFileSync(path, "utf8")))
        .filter(Boolean);
      if (!bumps.length) {
        errors.push(
          "Changed Lexicon JSON needs a Changeset for @hypercerts-org/lexicon.",
        );
      } else {
        errors.push(...lexiconChangeErrors(previous, current, bumps));
      }
    }
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
