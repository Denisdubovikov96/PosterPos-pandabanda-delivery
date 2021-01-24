/* eslint-disable */
export const toArray = (arg) => {
  const arr = [];
  const len = Object.keys(arg);
  for (let i = 0; i < len.length; i += 1) {
    arr.push(arg[i]);
  }
  return arr;
};
