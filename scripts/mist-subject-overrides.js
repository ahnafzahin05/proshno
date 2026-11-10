// Manually classified MIST written-question sets whose source subject labels
// were only counts. Question numbers here are 1-based positions in each file.
// Entries with no readable prompt are explicitly kept as unclassified.
const groups = (higherMath, physics, chemistry, english, unclassified = []) =>
  Object.fromEntries([
    ...higherMath.map(n => [n, "higher-math"]),
    ...physics.map(n => [n, "physics"]),
    ...chemistry.map(n => [n, "chemistry"]),
    ...english.map(n => [n, "english"]),
    ...unclassified.map(n => [n, "unclassified"]),
  ]);

export const MIST_SUBJECT_OVERRIDES = {
  "MIST 15-16": groups(
    [1, 4, 5, 8, 14, 15, 17, 20, 22, 26, 29, 32, 34, 38],
    [2, 3, 7, 9, 10, 11, 16, 18, 23, 25, 27, 31, 37, 39],
    [6, 12, 21, 24, 28, 30, 35, 36],
    [13, 19, 33],
  ),
  "MIST 16-17": groups(
    [1, 2, 4, 7, 8, 10, 18, 20, 22, 23, 25, 29, 31, 34, 36],
    [5, 9, 11, 12, 16, 19, 21, 26, 30, 32, 35, 37, 38],
    [6, 14, 15, 24, 27, 28, 33, 39],
    [3, 13, 17],
  ),
  "MIST 17-18": groups(
    [1, 6, 12, 15, 16, 19, 20, 23, 26, 32, 33, 34, 37],
    [2, 3, 4, 7, 11, 14, 21, 27, 28, 29, 31, 35, 36, 38, 39],
    [9, 10, 13, 17, 22, 24, 25, 30],
    [5, 8, 18],
  ),
  "MIST 18-19": groups(
    [4, 5, 7, 10, 12, 16, 19, 23, 25, 31, 35, 38, 39],
    [1, 2, 6, 8, 13, 15, 18, 20, 21, 22, 24, 29, 30, 36],
    [3, 9, 11, 14, 26, 32, 34],
    [27, 28, 33],
    [17, 37],
  ),
  "MIST 19-20": groups(
    [1, 4, 6, 8, 11, 17, 19, 20, 22, 23, 25, 31, 35, 37, 38],
    [2, 3, 5, 7, 9, 10, 13, 15, 16, 21, 24, 29, 30, 36],
    [12, 26, 32, 34],
    [14, 18, 27, 28, 33, 39],
  ),
  "MIST 20-21": groups(
    [1, 3, 9, 10, 12, 15, 16, 18],
    [2, 4, 5, 6, 7, 8, 11],
    [14, 17, 20],
    [13, 19],
  ),
  "MIST 21-22": groups(
    [2, 3, 4, 5, 7, 17, 19],
    [1, 8, 9, 11, 14, 15, 16, 18],
    [6, 10, 12, 13, 20],
    [],
  ),
  "MIST 22-23": groups(
    [1, 5, 11, 14, 16, 18, 22, 23, 28, 29, 33, 34, 36, 37],
    [2, 3, 4, 7, 8, 12, 15, 21, 24, 25, 31, 32, 35, 38, 39],
    [6, 13, 20, 26, 30],
    [9, 10, 19],
    [17, 27],
  ),
};
