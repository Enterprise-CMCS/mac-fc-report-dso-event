import { spawnSync } from "child_process";
import { readFileSync } from "fs";
import { arch, type } from "os";
import * as core from "@actions/core";

interface Artifact {
  goos: string;
  goarch: string;
  path: string;
}

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
    console.error("Error reading artifacts file:", error);
    process.exit(1);
  }
  const artifacts: Artifact[] = JSON.parse(data);

  const goArch = NodeArchToGoArch[arch()];
  const goOs = NodeTypeToGoOs[type()];
  const artifact = artifacts.find(
    (a) => a.goos === goOs && a.goarch === goArch
  );
  if (!artifact) {
    console.log("No artifact found for this OS and architecture");
    process.exit(1);
  }

  return artifact.path;
}

function main() {
  const args = core.getInput("args").split(" ");
  const path = getArtifactPath();
  const returns = spawnSync(path, args);
  const status = returns.status ?? 1;
  core.setOutput("exit-code", status);
  core.setOutput("output", returns.stdout.toString());
  core.setOutput("error-output", returns.stderr.toString());
  process.exit(status);
}

if (require.main === module) {
  main();
}
