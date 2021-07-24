import path from "path";
import Log from "../logging";
import { ConvertHrtime } from "../utils/helper";
import jsxCompiler from "./jsx";
import mdCompiler from "./md";

const compilers = {
  jsx: jsxCompiler,
  md: mdCompiler,
};

export async function compile(filePath, data) {
  var ext = path.extname(filePath).replace(/^\./, "");
  Log.verbose(`Processing ${ext} file: ${filePath}`);
  const startTime = process.hrtime();
  const response = await compilers[ext].compile(filePath, data);
  Log.verbose(
    `${ext} file processed in ${ConvertHrtime(process.hrtime(startTime))} s`
  );
  return response;
}

export default { compile };
