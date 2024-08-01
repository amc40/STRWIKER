export const sortArrayByPropertyAsc = <T>(
  array: T[],
  sortBy: (element: T) => number,
) => {
  return array.sort((a, b) => sortBy(a) - sortBy(b));
};

export const sortArrayByPropertyDesc = <T>(
  array: T[],
  sortBy: (element: T) => number,
) => {
  return array.sort((a, b) => sortBy(b) - sortBy(a));
};

export const sortArrayByNullablePropertyDescNullsLast = <T>(
  array: T[],
  sortBy: (element: T) => number | null,
) => {
  return array.sort((a, b) => {
    const sortByA = sortBy(a);
    const sortByB = sortBy(b);

    // ideally these would be 3 top-level if statements, but that makes ts sad
    if (sortByA === null) {
      if (sortByB === null) {
        return 0;
      }
      return 1;
    } else if (sortByB === null) {
      return -1;
    }
    return sortByB - sortByA;
  });
};
