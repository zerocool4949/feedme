const pluralSuffixes = ['ies', 'oes', 'es', 's'];

export function normalizeIngredientName(value: string): string {
  const cleaned = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\b(fresh|dried|large|small|medium|red|white|green|yellow)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned
    .split(' ')
    .map((word) => singularize(word))
    .join(' ')
    .trim();
}

function singularize(word: string): string {
  if (word.length <= 3) {
    return word;
  }

  for (const suffix of pluralSuffixes) {
    if (word.endsWith(suffix)) {
      if (suffix === 'ies') {
        return `${word.slice(0, -3)}y`;
      }
      return word.slice(0, -suffix.length);
    }
  }

  return word;
}
