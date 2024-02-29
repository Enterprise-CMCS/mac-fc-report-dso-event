import { spawnSync } from "child_process";
import { readFileSync } from "fs";
import { arch, type } from "os";
import * as core from "@actions/core";

type Artifact = {
  goos: string;
  goarch: string;
  path: string;
};

type StringToStringMap = {
  [key: string]: string;
};

const NodeArchToGoArch: StringToStringMap = {
  x64: "amd64",
};

const NodeTypeToGoOs: StringToStringMap = {
  Windows_NT: "windows",
  Darwin: "darwin",
  Linux: "linux",
};

// https://goreleaser.com/customization/builds/?h=guarantee#a-note-about-folder-names-inside-dist
function getArtifactPath(): string {
  let data: string;
  try {
    data = readFileSync("dist/artifacts.json", "utf8");
  } catch (error) {
    console.error(`Error reading artifacts file:", ${error}`);
    process.exit(1);
  }

  let artifacts: Artifact[];
  try {
    artifacts = JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing artifacts file: ${error}`);
    process.exit(1);
  }

  const nodeArch = arch();
  const goArch = NodeArchToGoArch[nodeArch];
  const nodeType = type();
  const goOs = NodeTypeToGoOs[nodeType];

  const artifact = artifacts.find(
    (a) => a.goos === goOs && a.goarch === goArch
  );
  if (!artifact) {
    console.error(
      `No artifact found. Node detected OS ${nodeType} and architecture: ${nodeArch}, which maps to GOOS: ${goOs} and GOARCH: ${goArch}`
    );
    process.exit(1);
  }

  return artifact.path;
}

function main() {
  const args = core.getInput("args").split(" ");
  const path = getArtifactPath();

  let returns;
  try {
    returns = spawnSync(path, args);
  } catch (error) {
    console.error(`Error spawning child process: ${error}`);
    process.exit(1);
  }

  const status = returns.status ?? 1;
  const stdout = returns.stdout.toString();
  const stderr = returns.stderr.toString();

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
