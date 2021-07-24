import dir from "node-dir";
import http from "http";
import sysPath from "path";
import { buildStaticPages } from "./handler";
import { ConvertHrtime } from "../utils/helper";
import Log from "../logging";

const MARKDOWN_FILE_PATTERN = "**/*.md";
const defaultVayuConfig = {
  contentPattern: "**/*.md",
  dev: {
    port: 3000,
  },
};

const buildPagesContext = async (directory, pattern) => {
  try {
    const files = await dir.promiseFiles(directory);
    return files.filter((fileName) => !pattern.test(fileName));
  } catch (error) {
    Log.error(error);
  }
  return [];
};

const buildHandler = async (source, pattern, layoutFolder) => {
  try {
    Log.info("Building the page context for all files");

    const pagesContext = await buildPagesContext(source, pattern);

    const main = async (req, res) => {
      const startTime = process.hrtime();
      const result = await processRequest(pagesContext, req, layoutFolder);
      if (result) {
        Log.info(`Responded in ${ConvertHrtime(process.hrtime(startTime))} s`);
        res.end(result);
        return;
      }
      res.end(`Page not found: ${req.url}`);
    };
    Log.info("Handler is ready now starting the server");

    return main;
  } catch (error) {
    Log.error(JSON.stringify(error));
  }
};

export const startApp = async (port, contentFolder, layoutFolder) => {
  Log.info(`Processing Content Directory ${contentFolder}`);

  try {
    const handler = await buildHandler(
      contentFolder,
      MARKDOWN_FILE_PATTERN,
      layoutFolder
    );
    const server = http.createServer(handler);
    server.listen(port, () => {
      Log.info(`Server started on port ${port}`);
    });
  } catch (error) {
    Log.error(`Server failed to start ${JSON.stringify(error)}`);
  }
};

export const setupVayuConfig = async (vayuConfig) => {
  vayuConfig = {
    ...defaultVayuConfig,
    ...vayuConfig,
  };

  vayuConfig.contentFolder = sysPath.resolve(
    process.cwd(),
    vayuConfig.contentFolder || "."
  );

  vayuConfig.dest = sysPath.resolve(
    process.cwd(),
    vayuConfig.dest || `${vayuConfig.contentFolder}/public`
  );
  return vayuConfig;
};

export const startBuilding = async (vayuConfig) => {
  try {
    vayuConfig = await setupVayuConfig(vayuConfig);
    Log.info(`Processing content from directory ${vayuConfig.contentFolder}`);

    await buildStaticPages(vayuConfig);

    Log.info(`Destination folder ${vayuConfig.dest}`);
    Log.done("Your website is ready");
  } catch (error) {
    Log.error("Building site failed");
    Log.error(error);
    Log.error(error.stack);
  }
};

export default buildPagesContext;
