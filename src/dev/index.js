import BS from "browser-sync";
import fs from "fs-extra";
import normalizePath from "normalize-path";
import Log from "../logging";
import path from "path";
import { renderContentFile } from "../content/handler";
import { setupVayuConfig, startBuilding } from "../content";
import { renderView } from "../transformers/jsx";
import DevPage from "../layout/devPage";
import url from "fast-url-parser";

const VAYU_DEV_SERVER = "VAYU_DEV_SERVER";

const dev = async (vayuConfig) => {
  const browsersync = BS.create(VAYU_DEV_SERVER);
  browsersync
    .watch(["**/*.jsx", "**/*.md"], {
      ignored: ["node_modules", /(^|[\/\\])\../],
    })
    .on("change", async (file) => {
      Log.info(`File change detected for ${file}`);
      browsersync.reload();
    });

  await startBuilding(vayuConfig);
  vayuConfig = await setupVayuConfig(vayuConfig);
  const serveHandler = await devServeHandlerBuilder(vayuConfig);

  Log.info(`Watching for changes`);

  browsersync.init({
    server: path.resolve(process.cwd(), vayuConfig.dest),
    logLevel: "silent",
    host: "127.0.0.1",
    port: vayuConfig.dev.port || 3000,
    middleware: [serveHandler],
  });
};

const normalizeUrlPath = (urlPath) => {
  return urlPath.replace(/^\//, "");
};

const devServeHandlerBuilder = async (vayuConfig) => {
  const devServeHandler = async (req, res, next) => {
    let stats = null;
    let view = null;
    let normalizePathName = normalizeUrlPath(
      decodeURIComponent(url.parse(req.url).pathname)
    );
    let absolutePath = path.resolve(process.cwd(), normalizePathName);
    try {
      Log.verbose(`Rendering in dev mode file: ${absolutePath}`);
      stats = await fs.lstat(absolutePath);
    } catch (err) {
      Log.verbose(
        `File ${absolutePath} does not exist in ${vayuConfig.contentFolder} content folder`
      );
      return next();
    }
    if (stats && stats.isDirectory()) {
      view = await renderDirectory(absolutePath);
    }
    if (stats && stats.isFile()) {
      if (absolutePath.indexOf(".html") !== -1) {
        absolutePath = absolutePath.split(".html").join(".md");
      }
      absolutePath = path.resolve(
        vayuConfig.contentFolder,
        path.relative(vayuConfig.dest, absolutePath)
      );
      view = await renderContentFile(absolutePath, vayuConfig);
    }
    return res.end(view);
  };
  return devServeHandler;
};

const renderDirectory = async (absoluteDirPath) => {
  const dirs = await fs.readdir(absoluteDirPath);
  const cwd = process.cwd();
  const displayFiles = await Promise.all(
    dirs
      .filter(
        (file) => !file.startsWith(".") && file.indexOf("node_modules") === -1
      )
      .map(normalizePath)
      .map(async (file) => {
        const absoluteChildPath = path.join(absoluteDirPath, file);
        const stats = await fs.lstat(absoluteChildPath);
        if (stats.isDirectory()) {
          return {
            name: file,
            type: "folder",
            href: `/${path.relative(cwd, absoluteChildPath)}`,
          };
        }
        return {
          name: file,
          type: "file",
          href: `/${path.relative(cwd, absoluteChildPath)}`,
        };
      })
  );
  // const view = await pipeline.execute(
  //   path.join(process.cwd(), "layout/devPage.jsx"),
  //   { files: displayFiles }
  // );
  const view = await renderView(DevPage, {
    files: displayFiles,
    directory: path.relative(process.cwd(), absoluteDirPath),
  });
  return view;
};
export default dev;
