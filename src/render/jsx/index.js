import path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server.node.js";
import { build } from "esbuild";
import { requireFromString } from "module-from-string";
import Log from "../../logging";
import { ConvertHrtime } from "../../utils/helper";

const TEMPLATE_CACHE = new Map();

export async function dynamicImport(layoutFile) {
  const startTime = process.hrtime();
  const absPathForLayout = path.resolve(layoutFile);
  Log.verbose(`Processing layout ${absPathForLayout}`);

  if (process.env.NODE_ENV === "production") {
    if (TEMPLATE_CACHE.has(absPathForLayout)) {
      return TEMPLATE_CACHE.get(absPathForLayout);
    }
  }

  try {
    const transformedCode = await bundleJSX(absPathForLayout);
    const module = requireFromString(transformedCode);
    TEMPLATE_CACHE.set(absPathForLayout, module.default);
    Log.verbose(
      `Parsed Layout in ${ConvertHrtime(process.hrtime(startTime))} ms`
    );
    return module.default;
  } catch (err) {
    Log.error("Parsing the layout failed");
    console.error(err);
  }
}

async function bundleJSX(absPathForLayout) {
  const entryPoints = [];
  entryPoints.push(absPathForLayout);
  const result = await build({
    entryPoints,
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    define: {
      "process.env.NODE_ENV": "'production'",
    },
  });
  return result.outputFiles[0].text;
}

export async function renderView(app, props) {
  const element = React.createElement(app, props);
  const response = await ReactDOMServer.renderToString(element);
  return response;
}

async function renderJSX(layoutFile, props, next) {
  const { ext } = path.parse(layoutFile);
  if (ext === ".jsx") {
    Log.verbose("Processing JSX layout");
    const App = await dynamicImport(layoutFile);
    const view = await renderView(App, props);
    return view;
  }
  return next();
}

export default renderJSX;
