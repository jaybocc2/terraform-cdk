import yargs from "yargs";
import { config as cfg } from "@cdktf/provider-generator";
import { requireHandlers } from "./helper/utilities";
import { Errors } from "../../lib/errors";

const config = cfg.readConfigSync();

class Command implements yargs.CommandModule {
  public readonly command = "synth [OPTIONS]";
  public readonly describe =
    "Synthesizes Terraform code for the given app in a directory.";
  public readonly aliases = ["synthesize"];

  public readonly builder = (args: yargs.Argv) =>
    args
      .positional("stack", {
        desc: "Stack to output when using --json flag",
        type: "string",
      })
      .option("app", {
        default: config.app,
        desc: "Command to use in order to execute cdktf app",
        alias: "a",
      })
      .option("output", {
        default: config.output,
        desc: "Output directory for the synthesized Terraform config",
        alias: "o",
      })
      .option("check-code-maker-output", {
        type: "boolean",
        desc: "Should `codeMakerOutput` existence check be performed? By default it will be checked if providers or modules are configured.",
        default: cfg.shouldCheckCodeMakerOutput(config),
      })
      .showHelpOnFail(true);

  public async handler(argv: any) {
    Errors.setScope("synth");
    // deferred require to keep cdktf-cli main entrypoint small (e.g. for fast shell completions)
    const api = requireHandlers();
    try {
      await api.synth(argv);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}

module.exports = new Command();
