export {};

const wordSeparatorsRegexp = /[ -]/;

String.prototype.getWordSeparator = function (this: string, index: number): string {
  const indexes = [] as Array<number>;

  // Get indexes of word separators characters from string value.
  for (const [i, letter] of [...this].entries()) {
    if (letter.match(wordSeparatorsRegexp)) {
      indexes.push(i);
    }
  }

  return this.charAt(indexes[index]) === ' ' ? '&nbsp;' : this.charAt(indexes[index]);
};

String.prototype.getWords = function (this: string): Array<string> {
  return this.split(wordSeparatorsRegexp);
};

String.prototype.isNumber = function (this: string): boolean {
  return !isNaN(Number(this));
};
