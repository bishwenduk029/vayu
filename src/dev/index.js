import BS from "browser-sync";
import fs from "fs-extra";
import normalizePath from "normalize-path";
import Log from "../logging";
import path from "path";
import { renderContentFile } from "../content/handler";
import { startBuilding } from "../main";
import getRenderPipeline from "../render";
import { renderView } from "../render/jsx";
import DevPage from "../layout/devPage";
import url from "fast-url-parser";

const VAYU_DEV_SERVER = "VAYU_DEV_SERVER";

const pipeline = getRenderPipeline();

const dev = async () => {
  const browsersync = BS.create(VAYU_DEV_SERVER);
  browsersync
    .watch(["**/*.jsx", "**/*.md"], {
      ignored: ["node_modules", /(^|[\/\\])\../],
    })
    .on("change", async (file) => {
      browsersync.reload();
    });

  await startBuilding(process.cwd());

  Log.info(`Watching for changes`);

  browsersync.init({
    server: path.join(process.cwd(), "public"),
    logLevel: "silent",
    host: "127.0.0.1",
    port: 8080,
    middleware: [devServeHandler],
  });
};

const devServeHandler = async (req, res, next) => {
  let stats = null;
  let view = null;
  let absolutePath = path.join(
    process.cwd(),
    decodeURIComponent(url.parse(req.url).pathname)
  );
  if (req.url === "/") {
    absolutePath = process.cwd();
  }
  try {
    stats = await fs.lstat(absolutePath);
  } catch (err) {
    if (absolutePath.indexOf(".html") !== -1) {
      absolutePath = absolutePath.split(".html").join(".md");
      stats = await fs.lstat(absolutePath);
    } else {
      return next();
    }
  }
  if (stats && stats.isDirectory()) {
    view = await renderDirectory(absolutePath);
  }
  if (stats && stats.isFile()) {
    view = await renderContentFile(absolutePath, null, pipeline);
  }
  return res.end(view);
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
            href: `${path.relative(cwd, absoluteChildPath)}`,
          };
        }
        return {
          name: file,
          type: "file",
          href: `${path.relative(cwd, absoluteChildPath)}`,
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
