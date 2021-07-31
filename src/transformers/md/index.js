import { micromark } from "micromark";
import fs from "fs-extra";
import matter from "gray-matter";
import path from "path";
import findFiles from "../../finders";

const CONTENT_CACHE = new Map();

export async function compile(fileName, data, vayuConfig) {
  const mainFileParsed = await parseMarkdown(fileName, vayuConfig);
  let response = mainFileParsed;
  let parsedPartials = {};
  if (mainFileParsed.data.partials) {
    parsedPartials = await findAndParseAllPartials(
      mainFileParsed.data.partials,
      vayuConfig
    );
  }
  return {
    ...response,
    data: {
      ...response.data,
      ...parsedPartials,
    },
  };
}

async function findAndParseAllPartials(partials, vayuConfig) {
  const stack = [];
  let response = {};
  stack.push(...partials);
  while (stack.length !== 0) {
    const partial = stack.pop();
    const partialParsed = await parseMarkdown(
      path.resolve(vayuConfig.contentFolder, partial),
      vayuConfig
    );
    if (!partialParsed.data.key) {
      throw new Error(
        `FrontMatter of the file ${path.resolve(
          vayuConfig.contentFolder,
          partial
        )} has a syntax error. If it is an abstract/partial content file then it should have a key`
      );
    }
    response = {
      ...response,
      [partialParsed.data.key]: partialParsed,
    };
  }
  return response;
}

async function parseMarkdown(fileName, vayuConfig) {
  if (CONTENT_CACHE.has(fileName)) {
    return CONTENT_CACHE.get(fileName);
  }
  const contentWithFrontMatter = await fs.readFile(fileName, "utf-8");
  let { data: frontMatter, content } = matter(
    contentWithFrontMatter.replaceAll(".md)", ".html)")
  );
  const toHtml = micromark(content);
  let response = {
    content: toHtml,
    data: frontMatter,
  };
  if (response.data.aggregator) {
    const aggregator = await resolveAggregation(
      response.data.aggregator,
      vayuConfig
    );
    response = {
      ...response,
      data: {
        ...response.data,
        aggregator,
      },
    };
  }
  if (process.env.NODE_ENV !== "development") {
    CONTENT_CACHE.set(fileName, response);
  }
  return response;
}

async function resolveAggregation(aggregate, vayuConfig) {
  let results = Object.keys(aggregate).reduce(async (result, key) => {
    const { dir, ext, name } = path.parse(
      path.join(vayuConfig.contentFolder, aggregate[key])
    );
    let mdFiles = await findFiles(`${name}${ext}`, dir);
    mdFiles = await Promise.all(
      mdFiles.map(async (fileName) => {
        const contentWithFrontMatter = await fs.readFile(fileName, "utf-8");
        const { data, content } = matter(contentWithFrontMatter);
        return { data, content };
      })
    );
    return {
      ...result,
      [key]: mdFiles,
    };
  }, {});
  return results;
}

export default {
  compile,
};
