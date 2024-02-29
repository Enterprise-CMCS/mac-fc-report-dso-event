### Compiling the Action code

The action is written in Typescript at `src/index.ts`, and it uses [`ncc`](https://github.com/vercel/ncc) to compile the Typescript module into a single file with all of its dependencies, which is referenced in the `action.yml`. It uses [`pnpm`](https://pnpm.io/installation) as a package manager. To compile:

1. [Install pnpm](https://pnpm.io/installation)
2. Run `pnpm compile`

After changing the source code in `src/index.ts`, you must compile the code to see the changes reflected in the GitHub Action. There is a workflow, `.github/workflows/check-compile.yml`, that will remind you to do this by failing if it finds that the code was not compiled.

### Building the `report-event` binaries

[TODO] This is a provisional process until we automate the release and consumption of the `report-event` binaries

This repo contains a `.goreleaser.yaml` configuration file that is used to build binaries of the `report-event` program for the [combinations of OS and architecture available on public GitHub Actions runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners#standard-github-hosted-runners-for-public-repositories). These binaries are a dependency of this Action. To build the binaries:

1. [Install goreleaser](https://goreleaser.com/install/)
2. Clone the [mac-fc-dso-metrics repo](https://github.com/Enterprise-CMCS/mac-fc-dso-metrics)
3. In the root directory of that repo, run `goreleaser build --snapshot --clean --config <path-to-.goreleaser.yaml>`. This will generate a `dist` folder with the binaries and some metadata files
4. Copy the `dist` folder and its contents to this repo

