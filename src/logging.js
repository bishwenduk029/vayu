/**
 * Returning ansi escape color codes
 * Credit to: https://github.com/chalk/ansi-styles
 *
 * @type {Object}
 */
export const Style = {
  /**
   * Parse ansi code while making sure we can nest colors
   *
   * @param  {string} text  - The text to be enclosed with an ansi escape string
   * @param  {string} start - The color start code, defaults to the standard color reset code 39m
   * @param  {string} end   - The color end code
   *
   * @return {string}       - The escaped text
   */
  parse: (
    text /*: string */,
    start /*: string */,
    end /*: string */ = `39m`
  ) /*: string */ => {
    if (text !== undefined) {
      const replace = new RegExp(`\\u001b\\[${end}`, "g"); // find any resets so we can nest styles

      return `\u001B[${start}${text
        .toString()
        .replace(replace, `\u001B[${start}`)}\u001b[${end}`;
    } else {
      return ``;
    }
  },

  /**
   * Style a string with ansi escape codes
   *
   * @param  {string} text - The string to be wrapped
   *
   * @return {string}      - The string with opening and closing ansi escape color codes
   */
  black: (text /*: string */) /*: string */ => Style.parse(text, `30m`),
  red: (text /*: string */) /*: string */ => Style.parse(text, `31m`),
  green: (text /*: string */) /*: string */ => Style.parse(text, `32m`),
  yellow: (text /*: string */) /*: string */ => Style.parse(text, `33m`),
  blue: (text /*: string */) /*: string */ => Style.parse(text, `34m`),
  magenta: (text /*: string */) /*: string */ => Style.parse(text, `35m`),
  cyan: (text /*: string */) /*: string */ => Style.parse(text, `36m`),
  white: (text /*: string */) /*: string */ => Style.parse(text, `37m`),
  gray: (text /*: string */) /*: string */ => Style.parse(text, `90m`),
  bold: (text /*: string */) /*: string */ => Style.parse(text, `1m`, `22m`),
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Logging prettiness
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * A logging object
 *
 * @type {Object}
 */
const Log = {
  verboseMode: false, // verbose flag
  output: false, // have we outputted something yet?
  hasError: false, // let’s assume the best

  /**
   * Log a welcome message
   *
   * @param  {string} text - The text you want to log
   */
  welcome: (text /*: string */) /*: void */ => {
    if (!Log.output) {
      // if we haven’t printed anything yet
      Log.space(); // only then we add an empty line on the top
    }

    Log.output = true; // now we have written something out
  },

  /**
   * Log an error
   *
   * @param  {string} text - The text you want to log with the error
   */
  error: (text /*: string */) /*: void */ => {
    if (!Log.output) {
      // if we haven’t printed anything yet
      Log.space(); // only then we add an empty line on the top
    }

    console.error(` 🔥  ${Style.red(`ERROR:   ${text}`)}`);

    Log.output = true; // now we have written something out
    Log.hasError = true; // and it was an error of all things
  },

  /**
   * Log a message
   *
   * @param  {string}  text - The text you want to log
   */
  info: (text /*: string */) /*: void */ => {
    if (!Log.output) {
      Log.space();
    }

    console.info(` 🔔  INFO:    ${Style.cyan(text)}`);
    Log.output = true;
  },

  /**
   * Log a warning message
   *
   * @param  {string}  text - The text you want to log
   */
  warn: (text /*: string */) /*: void */ => {
    if (Log.verboseMode) {
      if (!Log.output) {
        Log.space();
      }

      console.info(` 👀  WARN:    ${Style.cyan(text)}`);
      Log.output = true;
    }
  },

  /**
   * Log success
   *
   * @param  {string}  text - The text you want to log
   */
  ok: (text /*: string */) /*: void */ => {
    if (!Log.output) {
      Log.space();
    }

    console.info(` ✔  ${Style.green(`OK:`)}      ${Style.green(text)}`);
    Log.output = true;
  },

  /**
   * Log the final message
   *
   * @param  {string}  text - The text you want to log
   */
  done: (text /*: string */) /*: void */ => {
    if (!Log.output) {
      Log.space();
    }

    console.info(` 🚀           ${Style.green(Style.bold(text))}`);
    Log.hasError = false;

    Log.output = true;
  },

  /**
   * Log a verbose message
   *
   * @param  {string}  text - The text you want to log
   */
  verbose: (text /*: string */) /*: void */ => {
    if (Log.verboseMode) {
      if (!Log.output) {
        Log.space();
      }

      console.info(` 😬  ${Style.gray(`VERBOSE: ${text}`)}`);
      Log.output = true;
    }
  },

  /**
   * Add some space to the output
   */
  space: () /*: void */ => {
    console.log(`\n`);
  },
};

export default Log;
