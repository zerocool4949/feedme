const pluralSuffixes = ['ies', 'oes', 'es', 's'];
const units = [
  'kg',
  'g',
  'mg',
  'l',
  'dl',
  'cl',
  'ml',
  'el',
  'EL',
  'tl',
  'TL',
  'cs',
  'cc',
  'tbsp',
  'tsp',
  'pinch',
  'pinchée',
  'pincée',
  'prise',
  'cup',
  'cups',
];

export interface ParsedIngredient {
  quantity?: string;
  unit?: string;
  name: string;
}

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

export function parseIngredientLine(value: string): ParsedIngredient {
  const line = value.trim().replace(/\s+/g, ' ');
  const quantityMatch = line.match(/^(\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?|\d+\s*\/\s*\d+)\s+(.*)$/);

  if (!quantityMatch) {
    return { name: line };
  }

  const quantity = quantityMatch[1].replace(/\s+/g, '');
  const rest = quantityMatch[2].trim();
  const [possibleUnit, ...nameParts] = rest.split(' ');
  const normalizedUnit = possibleUnit.toLowerCase();

  if (units.includes(normalizedUnit) && nameParts.length > 0) {
    return {
      quantity,
      unit: possibleUnit,
      name: nameParts.join(' ').trim(),
    };
  }

  return {
    quantity,
    name: rest,
  };
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
