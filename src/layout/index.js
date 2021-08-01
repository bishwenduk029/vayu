import { pathExists } from "fs-extra";
import path from "path";
import findFiles from "../finders";
import Log from "../logging";

let layout_files = [];

export const DYNAMIC_PAGE = new RegExp("\\[(\\w+)\\]", "g");

export function resolveLayoutPath(pagePath, keys) {
  const pagesMap = keys.map((layoutPath) => {
    let test = layoutPath;
    let parts = [];

    const isDynamic = DYNAMIC_PAGE.test(layoutPath);

    if (isDynamic) {
      for (const match of layoutPath.matchAll(/\[(\w+)\]/g)) {
        parts.push(match[1]);
      }

      test = test.replace(DYNAMIC_PAGE, () => "([^/]+)");
    }

    test = test
      .replace("/", "\\/")
      .replace(/^\./, "")
      .replace(/\.(js|jsx|ts|tsx)$/, "");

    return {
      page: layoutPath,
      pagePath: layoutPath.replace(/^\./, "").replace(/\.(js|jsx|ts|tsx)$/, ""),
      parts,
      test: new RegExp("^" + test + "$", ""),
    };
  });
  /**
   * First, try to find an exact match.
   */
  let page = null;

  if (!page) {
    /**
     * Sort pages to include those with `index` in the name first, because
     * we need those to get matched more greedily than their dynamic counterparts.
     */
    pagesMap.sort((a) => (a.page.includes("index") ? -1 : 1));

    page = pagesMap.find((p) => p.test.test(pagePath));
  }

  /**
   * If an exact match couldn't be found, try giving it another shot with /index at
   * the end. This helps discover dynamic nested index pages.
   */
  if (!page) {
    page = pagesMap.find((p) => p.test.test(pagePath + "/index"));
  }

  if (!page) return null;

  /**
   * If pagePath ends in /index trim it off (unless page is /index) to match router
   * returned pagePath for the same page
   */
  page.pagePath = page.pagePath.replace(/(?<!^)\/index$/, "");

  if (!page.parts.length) return page;

  let params = {};

  page.test.lastIndex = 0;

  const matches = pagePath.matchAll(new RegExp(page.test, "g"));

  for (const match of matches) {
    page.parts.forEach((part, idx) => (params[part] = match[idx + 1]));
  }

  page.params = params;

  return page;
}

export async function deriveLayoutFileFromContentFile(
  contentFilePath,
  vayuConfig
) {
  try {
    const { ext: contentFileExtension } = path.parse(contentFilePath);

    const relativePathForContentFile = path.relative(
      vayuConfig.contentFolder,
      contentFilePath
    );
    if (layout_files.length === 0) {
      layout_files = await findFiles("**/*.jsx", vayuConfig.theme, false);
    }

    const resolvedPage = resolveLayoutPath(
      relativePathForContentFile.replace(contentFileExtension, ""),
      layout_files
    );
    if (!resolvedPage) {
      return null;
    }

    const layoutFile = path.resolve(vayuConfig.theme, resolvedPage?.page);
    if (pathExists(layoutFile)) {
      return layoutFile;
    }

    return null;
  } catch (e) {
    Log.error(e);
    return null;
  }
}

export async function getLayoutFile(contentFilePath, frontMatter, vayuConfig) {
  if (frontMatter.layout) {
    return path.resolve(vayuConfig.theme, frontMatter.layout);
  }

  let layoutFile = await deriveLayoutFileFromContentFile(
    contentFilePath,
    vayuConfig
  );

  if (!layoutFile) {
    let pseudoContentFilePath = path.relative(
      vayuConfig.contentFolder,
      contentFilePath
    );
    while (pseudoContentFilePath.length) {
      let { dir, name, ext } = path.parse(pseudoContentFilePath);
      let dirs = dir.split("/");
      pseudoContentFilePath = dirs.slice(0, dirs.length - 1).join("/");

      Log.verbose(`Looking for pseudo path ${pseudoContentFilePath}`);

      if (pseudoContentFilePath.length === 0) break;

      pseudoContentFilePath = path.join(pseudoContentFilePath, `${name}${ext}`);

      layoutFile = await deriveLayoutFileFromContentFile(
        path.resolve(vayuConfig.contentFolder, pseudoContentFilePath),
        vayuConfig
      );
      if (layoutFile) break;
    }
  }

  return layoutFile;
}
