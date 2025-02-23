import * as yargs from "yargs";
import { config as cfg } from "@cdktf/provider-generator";
import { requireHandlers } from "./helper/utilities";
import { Errors } from "../../lib/errors";

const config = cfg.readConfigSync();

class Command implements yargs.CommandModule {
  public readonly command = "watch [OPTIONS] <stacks..>";
  public readonly describe =
    "[experimental] Watch for file changes and automatically trigger a deploy";

  public readonly builder = (args: yargs.Argv) =>
    args
      .positional("stacks", {
        desc: "Deploy stacks matching the given ids. Required when more than one stack is present in the app",
        type: "string",
      })
      .option("app", {
        default: config.app,
        required: true,
        desc: "Command to use in order to execute cdktf app",
        alias: "a",
      })
      .option("output", {
        default: config.output,
        required: true,
        desc: "Output directory for the synthesized Terraform config",
        alias: "o",
      })
      .option("auto-approve", {
        type: "boolean",
        default: false,
        required: false,
        desc: "Auto approve",
      })
      .option("parallelism", {
        type: "number",
        required: false,
        desc: "Number of concurrent CDKTF stacks to run. Defaults to infinity, denoted by -1",
        default: -1,
      })
      .showHelpOnFail(true);

  public async handler(argv: any) {
    Errors.setScope("watch");
    // deferred require to keep cdktf-cli main entrypoint small (e.g. for fast shell completions)
    const api = requireHandlers();
    try {
      await api.watch(argv);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}

module.exports = new Command();
