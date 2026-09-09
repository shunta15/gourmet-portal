/**
 * Normalize Japanese text for consistent searching
 * Applies: NFKC normalization → lowercase → hiragana conversion
 */
export function normalizeJa(s: string): string {
  // NFKC: Compatibility decomposition and canonical composition
  // Converts half-width to full-width katakana
  let normalized = s.normalize("NFKC");

  // Lowercase (though Japanese has limited lowercase)
  normalized = normalized.toLowerCase();

  // Convert full-width katakana to hiragana by subtracting 0x60
  // Katakana range: U+30A1 to U+30F6, Hiragana: U+3041 to U+3096
  normalized = normalized.replace(/[ァ-ヶ]/g, (match) => {
    const code = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(code);
  });

  // Remove whitespace
  normalized = normalized.replace(/\s+/g, "");

  return normalized;
}
