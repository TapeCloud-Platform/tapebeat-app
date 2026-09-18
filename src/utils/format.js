const COMPACT_FORMAT = new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' });

export function formatCompactNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? COMPACT_FORMAT.format(parsed) : value;
}

/** Reemplaza cada número suelto de un texto por su versión abreviada (ej: 831920 -> 832K). */
export function abbreviateNumbersInText(text) {
  if (!text) {
    return text;
  }
  return text.replace(/\d+/g, (match) => formatCompactNumber(Number(match)));
}
