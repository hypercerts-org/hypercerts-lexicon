import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Any Lexicon change alters the published API and SDK, so it is at least a
// minor release. Maintainers bypass this check for the rare exception.

const DOCS_PR =
  /(?:https:\/\/github\.com\/hypercerts-org\/documentation\/pull\/|\bhypercerts-org\/documentation#)\d+\b/;

export function changesetBump(markdown) {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return frontmatter?.[1].match(
    /^\s*["']?@hypercerts-org\/lexicon["']?\s*:\s*(patch|minor|major)\s*$/m,
  )?.[1];
}

export function contributorErrors(lexiconsChanged, bumps) {
  if (!lexiconsChanged) return [];
  if (!bumps.length) {
    return [
      "Changed Lexicon JSON needs a minor or major Changeset for @hypercerts-org/lexicon.",
    ];
  }
  if (!bumps.some((bump) => bump === "minor" || bump === "major")) {
    return [
      "Lexicon changes alter the published API and SDK: use a minor or major Changeset, not patch.",
    ];
  }
  return [];
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

export function releasePrErrors(previous, version, lexiconsChanged, body) {
  const kind = releaseKind(previous, version);
  if (kind === "patch") {
    return lexiconsChanged
      ? [
          `Lexicon ${version} is a patch release, but Lexicons changed since ${previous}. It must be a minor or major release.`,
        ]
      : [];
  }
  if (!DOCS_PR.test(body)) {
    return [
      `Lexicon ${version} is a ${kind} release: link the hypercerts-org/documentation PR with its release note in this PR's description.`,
    ];
  }
  return [];
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function changedFiles(from, path) {
  return git("diff", "--name-only", "-z", from, "HEAD", "--", path)
    .split("\0")
    .filter(Boolean);
}

function lexiconsChangedSince(ref) {
  return changedFiles(ref, "lexicons/").some((path) => path.endsWith(".json"));
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
        `Cannot find tag ${tag} for the last release, so this release cannot be checked.`,
      );
    } else {
      const body =
        JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"))
          .pull_request?.body || "";
      errors.push(
        ...releasePrErrors(previous, version, lexiconsChangedSince(tag), body),
      );
    }
  } else {
    const bumps = changedFiles(mergeBase, ".changeset/")
      .filter((path) => path.endsWith(".md") && existsSync(path))
      .map((path) => changesetBump(readFileSync(path, "utf8")))
      .filter(Boolean);
    errors.push(...contributorErrors(lexiconsChangedSince(mergeBase), bumps));
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
