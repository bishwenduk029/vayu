#!/usr/bin/env node
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import log from "./logging.js";
import { startApp, startBuilding } from "./main.js";
import startDevServer from "./dev";

const AMBA_PORT = "3000";

yargs(hideBin(process.argv))
  .command(
    "serve [port]",
    "start the server",
    (yargs) => {
      return yargs.positional("port", {
        describe: "port to bind on",
        default: AMBA_PORT,
      });
    },
    (argv) => {
      const contentFolder = path.resolve(process.cwd());
      const layoutFolder = path.resolve(process.cwd(), "./layout");
      if (argv.verbose) {
        log.verboseMode = true;
        console.info(`start server on :${argv.port}`);
        console.info(`Current Working Directory :${process.cwd()}`);
        console.info(`Processing content from folder :${contentFolder}`);
        console.info(`Applying layout from folder :${layoutFolder}`);
      }
      startApp(argv.port, contentFolder, layoutFolder);
    }
  )
  .command(
    "build",
    "build website",
    () => {},
    (argv) => {
      if (argv.verbose) {
        log.verboseMode = true;
      }
      const contentFolder = path.resolve(process.cwd());
      let layoutFolder = path.resolve(process.cwd(), "./layout");
      if (argv.theme) {
        layoutFolder = argv.theme;
      }
      startBuilding(contentFolder, layoutFolder);
    }
  )
  .option("theme", {
    alias: "t",
    type: "string",
    description: "Provide the theme folder to use for rendering the site",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .command(
    "dev",
    "Live build your website",
    () => {},
    (argv) => {
      if (argv.verbose) {
        log.verboseMode = true;
      }
      process.env["NODE_ENV"] = "development";
      startDevServer();
    }
  ).argv;
