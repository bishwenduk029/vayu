import { micromark } from "micromark";
import fs from "fs-extra";
import Log from "../../logging";
import matter from "gray-matter";

export async function compile(filename) {
  try {
    const contentWithFrontMatter = await fs.readFile(filename, "utf-8");
    const parsedMatter = matter(
      contentWithFrontMatter.replaceAll(".md)", ".html)")
    );
    const toHtml = await micromark(parsedMatter.content);
    return {
      content: toHtml,
      data: parsedMatter.data,
    };
  } catch (error) {
    Log.error("Markdown parsing failed");
    Log.error(error);
  }
}

export default {
  compile,
};
