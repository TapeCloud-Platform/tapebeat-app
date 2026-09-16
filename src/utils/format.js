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

/**
 * Extrae un número de la descripción cruda que devuelve el backend
 * (ej: "Artista · 116061 oyentes · 947091 reproducciones"). No hay estos
 * datos como campos separados, así que se parsean del texto.
 */
export function extractStat(description, label) {
  if (!description) {
    return 0;
  }
  const match = description.match(new RegExp(`(\\d+)\\s*${label}`, 'i'));
  return match ? Number(match[1]) : 0;
}
