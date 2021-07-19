import buildPagesContext from "./content/index";
import { processRequest, buildStaticPages } from "./content/handler";
import log from "./logging.js";
import http from "http";
import { ConvertHrtime } from "./utils/helper";
import findFiles from "./finders";

const MARKDOWN_FILE_PATTERN = "**/*.md";

const buildHandler = async (source, pattern, layoutFolder) => {
  try {
    log.info("Building the page context for all files");

    const pagesContext = await buildPagesContext(source, pattern);

    const main = async (req, res) => {
      const startTime = process.hrtime();
      const result = await processRequest(pagesContext, req, layoutFolder);
      if (result) {
        log.info(`Responded in ${ConvertHrtime(process.hrtime(startTime))} ms`);
        res.end(result);
        return;
      }
      res.end(`Page not found: ${req.url}`);
    };
    log.info("Handler is ready now starting the server");

    return main;
  } catch (error) {
    log.error(JSON.stringify(error));
  }
};

export const startApp = async (port, contentFolder, layoutFolder) => {
  log.info(`Processing Content Directory ${contentFolder}`);

  try {
    const handler = await buildHandler(
      contentFolder,
      MARKDOWN_FILE_PATTERN,
      layoutFolder
    );
    const server = http.createServer(handler);
    server.listen(port, () => {
      log.info(`Server started on port ${port}`);
    });
  } catch (error) {
    log.error(`Server failed to start ${JSON.stringify(error)}`);
  }
};

export const startBuilding = async (contentFolder, layoutFolder) => {
  try {
    log.info(`Processing content from directory ${contentFolder}`);
    const mdFiles = await findFiles(MARKDOWN_FILE_PATTERN, contentFolder);
    log.info(`Found ${mdFiles.length} content files to build site`);
    if (mdFiles.length) {
      await buildStaticPages(mdFiles, layoutFolder);
      log.done("Your website is ready");
      return;
    }
    log.error("No markdown files found.");
  } catch (error) {
    log.error("Building site failed");
    log.error(error);
    console.log(error.stack);
  }
};
