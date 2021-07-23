import fs from "fs-extra";
import { getContent } from "./resolver.js";
import Log from "../logging.js";
import { ConvertHrtime } from "../utils/helper.js";
import path from "path";
import { parseMarkdown } from "./resolver";
import DefaultApp from "../layout/main";
import getRenderPipeline from "../render/index.js";
import { renderView } from "../render/jsx/index.js";
import { findContentFiles } from "./index.js";

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
      `Web Page rendered in ${ConvertHrtime(process.hrtime(startTime))} ms`
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
  const renderPipeline = getRenderPipeline();

  await Promise.all(
    contentFiles.map(async (contentFile) => {
      await renderContentFile(contentFile, vayuConfig.theme, renderPipeline);
    })
  );
  Log.info(
    `Web site rendered in ${ConvertHrtime(process.hrtime(startTime))} ms`
  );
}

export async function renderContentFile(contentFile, theme, renderPipeline) {
  const props = await parseMarkdown(contentFile);

  // In case there is no layout in content then use the default view shipped in here.
  if (!props.data.layout) {
    Log.warn(
      "Oops could not find layout in content to render with, so using default"
    );
    Log.verbose(`The content file ${contentFile}`);

    if (theme) {
      const view = await renderPipeline.execute(
        path.join(theme, "index.jsx"),
        props
      );
      await serializeViewToFile(view, contentFile);
      if (process.env.NODE_ENV === "development") {
        return view;
      }
      return;
    }

    const view = await renderView(DefaultApp, props);
    await serializeViewToFile(view, contentFile);
    if (process.env.NODE_ENV === "development") {
      return view;
    }
    return;
  }

  // Use the content specific layout for rendering the views.
  const view = await renderPipeline.execute(
    path.join(theme, props.data.layout),
    props
  );
  await serializeViewToFile(view, contentFile);
  if (process.env.NODE_ENV === "development") {
    return view;
  }
  return;
}

export async function serializeViewToFile(view, sourceFile) {
  const sourceFolder = process.cwd();
  const destinationFolder = `${sourceFolder}/public`;
  const { name } = path.parse(sourceFile);
  const absoluteFilePath = path
    .resolve(sourceFile.split(".md").join(".html"))
    .split(sourceFolder)
    .join(destinationFolder);
  Log.verbose(`Writing ${name}.html to ${absoluteFilePath}`);
  await fs.outputFile(`${absoluteFilePath}`, view, "utf-8");
}

function normalizePathname(pathname) {
  return pathname === "/" || /graphql$/.test(pathname) ? "/index" : pathname;
}
