export interface TextPart {
  text: string;
  /** Hyphenated word that should not break across lines at its hyphen. */
  nowrap: boolean;
}

/**
 * Splits display text so hyphenated words ("real-time", "post-processing")
 * can be wrapped in a no-wrap span instead of breaking at the hyphen.
 */
export function splitHyphenated(text: string): TextPart[] {
  return text
    .split(/(\S+-\S+)/)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, nowrap: /^\S+-\S+$/.test(part) }));
}
