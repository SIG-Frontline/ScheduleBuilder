const seasonMap: { [key: string]: string } = {
  "10": "Spring",
  "50": "Summer",
  "90": "Fall",
  "95": "Winter",
};
export function prettyTermText(
  term: string | number,
  char_len: number = -1
): string {
  //verify that term is a string
  if (typeof term === "number") {
    term = term.toString();
  }
  //validate the term is in the correct format
  if (!/^\d{4}(10|50|90|95)$/.test(term)) {
    throw new Error(`Invalid term: ${term}`);
  }

  //202490 -> 2024
  const year = term.slice(0, 4);
  //202490 -> 90
  const season = term.slice(4, 6);
  //90 -> Fall
  const seasonText = seasonMap[season];
  //if the char_len is -1, return the full term text, otherwise return the shortened term text
  if (char_len === -1) {
    return `${year} ${seasonText}`;
  }
  return `${seasonText.slice(0, char_len)}' ${year}`;
}
