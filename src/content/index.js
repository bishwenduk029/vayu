import Log from "../logging.js";
import dir from "node-dir";
import findFiles from "../finders/index.js";

const buildPagesContext = async (directory, pattern) => {
  try {
    const files = await dir.promiseFiles(directory);
    return files.filter((fileName) => !pattern.test(fileName));
  } catch (error) {
    Log.error(error);
  }
  return [];
};

export const findContentFiles = async (pattern, contentFolder) => {
  try {
    const contentFiles = await findFiles(pattern, contentFolder);
    return contentFiles;
  } catch (error) {
    Log.error("Yikes, encountered an error while looking for content files");
  }
};

export default buildPagesContext;
