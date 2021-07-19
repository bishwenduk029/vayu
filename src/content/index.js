import Log from "../logging.js";
import dir from "node-dir";

const buildPagesContext = async (directory, pattern) => {
  try {
    const files = await dir.promiseFiles(directory);
    return files.filter((fileName) => !pattern.test(fileName));
  } catch (error) {
    Log.error(error);
  }
  return [];
};

export default buildPagesContext;
