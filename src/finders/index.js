import path from "path";
import glob from "tiny-glob";
import Log from "../logging";

const findFiles = async (pattern, directory, absolute = true) => {
  Log.verbose(`Looking for pattern ${pattern} in ${directory}`);
  let files = await glob(pattern, {
    cwd: path.resolve(directory),
    absolute,
    filesOnly: true,
  });
  return files;
};

export default findFiles;
