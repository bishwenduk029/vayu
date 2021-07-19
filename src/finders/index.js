import path from "path";
import glob from "tiny-glob";

const findFiles = async (pattern, directory) => {
  let files = await glob(pattern, {
    cwd: path.resolve(directory),
    absolute: true,
    filesOnly: true,
  });
  return files;
};

export default findFiles;
