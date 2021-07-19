import { micromark } from "micromark";
import fs from "fs";
import log from "../logging.js";
import { ConvertHrtime } from "../utils/helper.js";
import matter from "gray-matter";

const cache = new Map();

export function resolveContentPath(pagePath, keys) {
  const pagesMap = keys.map((page) => {
    let test = page;

    test = test
      .replace("/", "\\/")
      .replace(/^\./, "")
      .replace(/\.(md)$/, "");

    return {
      page,
      pagePath: page.replace(/^\./, "").replace(/\.(md)$/, ""),
      test: new RegExp("^" + test + "$", ""),
    };
  });
  let page = pagesMap.find((p) => p.pagePath.indexOf(pagePath) >= 0);

  if (!page) return null;

  return page;
}

export async function getContent(pagePath, context) {
  try {
    const resolvedPage = resolveContentPath(pagePath, context);
    if (!resolvedPage) {
      return null;
    }

    if (cache.has(resolvedPage.page)) {
      return cache.get(resolvedPage.page);
    }

    const output = await parseMarkdown(resolvedPage.page);
    cache.set(resolvedPage.page, toHtml);
    return output;
  } catch (e) {
    log.error(e);
  }
}

export async function parseMarkdown(filename) {
  log.verbose(`Processing Markdown file: ${filename}`);
  const startTime = process.hrtime();
  try {
    const contentWithFrontMatter = await fs.promises.readFile(
      filename,
      "utf-8"
    );
    const parsedMatter = matter(
      contentWithFrontMatter.replaceAll(".md)", ".html)")
    );
    const toHtml = await micromark(parsedMatter.content);
    log.verbose(
      `Markdown content parsed in ${ConvertHrtime(
        process.hrtime(startTime)
      )} ms`
    );
    return {
      content: toHtml,
      data: parsedMatter.data,
    };
  } catch (error) {
    log.error("Markdown parsing failed");
    log.error(error);
  }
}
