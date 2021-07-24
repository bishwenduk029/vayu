/**
 * Convert hrtime to seconds
 *
 * @param {array} elapsedTime - The elapsed time started and stopped with process.hrtime
 */
export const ConvertHrtime = (
  elapsedTime /*: number[] | number */
) /*: number | string */ => {
  if (Array.isArray(elapsedTime)) {
    return (elapsedTime[0] + elapsedTime[1] / 1e9).toFixed(3);
  } else {
    return elapsedTime;
  }
};
