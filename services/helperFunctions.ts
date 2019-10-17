export const isInArray = (arr: string[], id: string): boolean => {
  if (arr.indexOf(id) === -1) {
    return false;
  }
  return true;
};
