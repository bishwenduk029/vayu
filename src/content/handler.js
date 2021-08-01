import fs from "fs-extra";
import { getContent } from "./resolver.js";
import Log from "../logging.js";
import { ConvertHrtime } from "../utils/helper.js";
import path from "path";
import DefaultApp from "../layout/ui/main";
import transformer from "../transformers";
import { renderView } from "../transformers/jsx";
import findFiles from "../finders/index.js";
import { getLayoutFile } from "../layout/index.js";
import pMap from "p-map";

export const findContentFiles = async (pattern, contentFolder) => {
  Log.verbose(`Looking for pattern ${pattern} in ${contentFolder}`);
  try {
    const contentFiles = await findFiles(pattern, contentFolder);
    return contentFiles;
  } catch (error) {
    Log.error("Yikes, encountered an error while looking for content files");
  }
};

export async function processRequest(pagesContext, req, layoutFolder) {
  const normalizedPathname = normalizePathname(req.url);

  const props = await getContent(normalizedPathname, pagesContext);
  if (!content) return null;
  const response = await renderPage(props, layoutFolder);
  return response;
}

async function renderPage(props, layoutFolder) {
  const startTime = process.hrtime();
  try {
    const App = await dynamicImport(layoutFolder);
    const response = await renderView(App, props);

    Log.info(
      `Web Page rendered in ${ConvertHrtime(process.hrtime(startTime))} s`
    );

    return response;
  } catch (error) {
    Log.error("The page rendering failed");
    console.error(error);
    return "Could Not render the page";
  }
}

export async function buildStaticPages(vayuConfig) {
  const startTime = process.hrtime();
  const contentFiles = await findContentFiles(
    vayuConfig.contentPattern,
    vayuConfig.contentFolder
  );
  Log.info(`Found ${contentFiles.length} content files to build site`);
  if (!contentFiles.length) {
    throw new Error(
      `No content files found matching the pattern ${vayuConfig.contentPattern}`
    );
  }

  const mapper = async (contentFile) => {
    await renderContentFile(contentFile, vayuConfig);
  };

  await pMap(contentFiles, mapper, { concurrency: 25 });
  Log.info(
    `Web site rendered in ${ConvertHrtime(process.hrtime(startTime))} s`
  );
}

export async function renderContentFile(contentFile, vayuConfig) {
  Log.verbose(`Rendering file ${contentFile}`);
  const props = await transformer.compile(contentFile, null, vayuConfig);

  if (!props) {
    return null;
  }

  if (vayuConfig.theme) {
    const absoluteLayoutFile = await getLayoutFile(
      contentFile,
      props.data,
      vayuConfig
    );
    const view = await transformer.compile(
      absoluteLayoutFile,
      props,
      vayuConfig
    );
    await serializeViewToFile(view, contentFile, vayuConfig);
    if (process.env.NODE_ENV === "development") {
      return view;
    }
    return;
  }

  const view = await renderView(DefaultApp, props, vayuConfig);
  await serializeViewToFile(view, contentFile, vayuConfig);
  if (process.env.NODE_ENV === "development") {
    return view;
  }
  return;
}

export async function serializeViewToFile(view, sourceContentFile, vayuConfig) {
  if (!view) {
    return;
  }
  const contentFileRelativePath = path.relative(
    vayuConfig.contentFolder,
    sourceContentFile
  );
  const { dir, name } = path.parse(contentFileRelativePath);
  const absoluteFilePath = path.format({
    dir: `${vayuConfig.dest}/${dir}`,
    name,
    ext: ".html",
  });
  Log.verbose(`Writing ${name}.html to ${absoluteFilePath}`);
  await fs.outputFile(`${absoluteFilePath}`, view, "utf-8");
}

function normalizePathname(pathname) {
  return pathname === "/" || /graphql$/.test(pathname) ? "/index" : pathname;
}
