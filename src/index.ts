import { spawnSync } from "child_process";
import { arch, type } from "os";
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import * as semver from "semver";
import fs from "fs/promises";
import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";

const releaseRepoOwner = "Enterprise-CMCS";
const releaseRepo = "mac-fc-report-event-releases";

const octokit = new Octokit({
  auth: core.getInput("token"),
});

type ListReleasesResponseDataType = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.repos.listReleases
>;

async function downloadAsset(name: string, url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error downloading asset: ${response.statusText}`);
  }

  const data = await response.arrayBuffer();
  const buffer = Buffer.from(data);
  try {
    await fs.writeFile(name, buffer, { mode: 755 });
  } catch (error) {
    throw new Error(`Error writing the release asset to file: ${error}`);
  }
}

async function downloadRelease(version: string): Promise<string> {
  let releases: ListReleasesResponseDataType;
  try {
    const response = await octokit.repos.listReleases({
      owner: releaseRepoOwner,
      repo: releaseRepo,
    });
    releases = response.data;
  } catch (error) {
    throw new Error(
      `Error listing releases for ${releaseRepoOwner}/${releaseRepo}: ${error}`
    );
  }

  // sort descending by tag so that "*" selects the latest version
  releases.sort((a, b) => semver.rcompare(a.tag_name, b.tag_name));
  const validRelease = releases.find((release) =>
    semver.satisfies(release.tag_name, version)
  );
  if (!validRelease) {
    throw new Error(
      `No release found that satisfies version constraint: ${version}`
    );
  }
  console.log(`Using release ${validRelease.name}`);

  const nodeArch = arch();
  const nodeType = type();
  const asset = validRelease.assets.find(
    (a) => a.name.includes(nodeArch) && a.name.includes(nodeType)
  );
  if (!asset) {
    throw new Error(
      `No release asset found for runner arch: ${nodeArch} and runner type: ${nodeType}`
    );
  }

  try {
    await downloadAsset(asset.name, asset.browser_download_url);
  } catch (error) {
    throw new Error(`Error downloading release asset: ${error}`);
  }

  return asset.name;
}

async function main() {
  const version = core.getInput("version");
  const args = core.getInput("args").split(" ");

  let releaseName;
  try {
    releaseName = await downloadRelease(version);
  } catch (error) {
    console.error(`Error downloading release: ${error}`);
    process.exit(1);
  }

  let returns;
  try {
    returns = spawnSync(`./${releaseName}`, args);
  } catch (error) {
    console.error(`Error spawning child process: ${error}`);
    process.exit(1);
  }

  const status = returns.status ?? 1;
  const stdout = returns.stdout.toString();
  const stderr = returns.stderr.toString();

  // print the report-event output in the GitHub Action logs
  console.log(stdout);
  console.error(stderr);

  core.setOutput("exit-code", status);
  core.setOutput("output", stdout);
  core.setOutput("error-output", stderr);

  process.exit(status);
}

if (require.main === module) {
  main();
}
