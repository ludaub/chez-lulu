export {};

declare global {
  interface String {
    getWordSeparator(this: string, index: number): string;
    getWords(this: string): Array<string>;
    isNumber(this: string): boolean;
  }
}
