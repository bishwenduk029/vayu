import path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server.node.js";
import Html from "../../layout/ui/html";
import { build } from "esbuild";
import { requireFromString } from "module-from-string";

const TEMPLATE_CACHE = new Map();

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

export async function dynamicImport(layoutFile) {
  const absPathForLayout = path.resolve(layoutFile);

  if (process.env.NODE_ENV === "production") {
    if (TEMPLATE_CACHE.has(absPathForLayout)) {
      return TEMPLATE_CACHE.get(absPathForLayout);
    }
  }

  const transformedCode = await bundleJSX(absPathForLayout);
  const module = requireFromString(transformedCode);
  TEMPLATE_CACHE.set(absPathForLayout, module.default);
  return module.default;
}

export async function renderView(app, data, vayuConfig) {
  const element = React.createElement(app, data);
  const { seo, htmlAttributes, bodyAttributes } = vayuConfig;
  const response = await ReactDOMServer.renderToStaticMarkup(
    React.createElement(Html, { seo, htmlAttributes, bodyAttributes }, element)
  );
  return "<!DOCTYPE html>" + response;
}

export async function compile(fileName, data, vayuConfig) {
  const App = await dynamicImport(fileName);
  if (!App) {
    return null;
  }
  const view = await renderView(App, data, vayuConfig);
  return view;
}

export default {
  compile,
};
