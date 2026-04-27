export interface RecipeSegment {
  text: string;
  isMeasurement: boolean;
}

export interface MeasurementDetail {
  originalText: string;
  scaledText: string;
}

export function formatScaleAsRatio(scale: number): string {
  // Round to avoid floating point precision issues
  const rounded = Math.round(scale * 1000) / 1000;

  // If it's a whole number, just return it
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return `${Math.round(rounded)}×`;
  }

  // For fractions less than 1
  if (rounded < 1) {
    // Try common fractions
    const fractions = [
      { num: 1, den: 2, value: 0.5 },
      { num: 1, den: 3, value: 0.333 },
      { num: 1, den: 4, value: 0.25 },
      { num: 1, den: 5, value: 0.2 },
      { num: 1, den: 6, value: 0.167 },
      { num: 2, den: 3, value: 0.667 },
      { num: 3, den: 4, value: 0.75 },
      { num: 3, den: 5, value: 0.6 },
    ];

    for (const frac of fractions) {
      if (Math.abs(rounded - frac.value) < 0.01) {
        return `${frac.num}-${frac.den}`;
      }
    }
  }

  // For multiples
  if (rounded > 1) {
    // Check if it's a simple multiple like 2, 3, 4
    const intVal = Math.round(rounded);
    if (Math.abs(rounded - intVal) < 0.05) {
      return `${intVal}×`;
    }

    // Try common fractions like 1.5 = 3-2
    const fractions = [
      { num: 3, den: 2, value: 1.5 },
      { num: 5, den: 2, value: 2.5 },
      { num: 5, den: 3, value: 1.667 },
      { num: 7, den: 4, value: 1.75 },
    ];

    for (const frac of fractions) {
      if (Math.abs(rounded - frac.value) < 0.05) {
        return `${frac.num}-${frac.den}`;
      }
    }
  }

  // Fallback
  return `${rounded.toFixed(2)}×`;
}

const units = [
  'cups?',
  'tablespoons?',
  'tbsp',
  'tsp',
  'ounces?',
  'oz',
  'pounds?',
  'lbs?',
  'grams?',
  'g',
  'kilograms?',
  'kg',
  'milliliters?',
  'ml',
  'liters?',
  'l',
];

const unitsPattern = units.join('|');

// Create regex pattern as a string literal
const measurementPattern = `(\\d+(?:\\s+\\d+)?(?:\\/\\d+)?|\\d+\\.\\d+)\\s*(${unitsPattern})\\b`;

function createMeasurementRegex() {
  return new RegExp(measurementPattern, 'gi');
}

function parseAmount(value: string): number {
  const mixedMatch = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);
    return whole + numerator / denominator;
  }

  const fractionMatch = value.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    return numerator / denominator;
  }

  return Number(value);
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

function formatAsFraction(value: number): string {
  const sign = value < 0 ? -1 : 1;
  const absoluteValue = Math.abs(value);
  const integerPart = Math.floor(absoluteValue);
  const fractionPart = absoluteValue - integerPart;

  if (fractionPart < 0.0075) {
    return `${sign * integerPart}`;
  }

  let bestNumerator = 1;
  let bestDenominator = 1;
  let bestError = Math.abs(fractionPart - 1);
  const maxDenominator = 16;

  for (let denominator = 1; denominator <= maxDenominator; denominator += 1) {
    const numerator = Math.round(fractionPart * denominator);
    const approximation = numerator / denominator;
    const error = Math.abs(fractionPart - approximation);

    if (error < bestError) {
      bestError = error;
      bestNumerator = numerator;
      bestDenominator = denominator;
    }
  }

  if (bestNumerator === 0) {
    return `${sign * integerPart}`;
  }

  const gcd = greatestCommonDivisor(bestNumerator, bestDenominator);
  const numerator = bestNumerator / gcd;
  const denominator = bestDenominator / gcd;
  const finalInteger = integerPart;
  const signedInteger = sign * finalInteger;

  if (finalInteger > 0) {
    return `${signedInteger} ${numerator}-${denominator}`;
  }

  return `${sign < 0 ? '-' : ''}${numerator}-${denominator}`;
}

export function formatMeasurement(value: number): string {
  const roundedValue = Math.abs(value) < 0.0001 ? 0 : value;
  const roundedToTwo = Math.round(roundedValue * 100) / 100;
  const integerValue = Math.round(roundedToTwo);

  if (Math.abs(roundedToTwo - integerValue) < 0.01) {
    return `${integerValue}`;
  }

  const fractionText = formatAsFraction(roundedToTwo);
  if (fractionText.includes('-')) {
    return fractionText;
  }

  return roundedToTwo.toFixed(2).replace(/\.00$/, '');
}

export function getMeasurementDetails(recipeText: string, scale: number): MeasurementDetail[] {
  const details: MeasurementDetail[] = [];
  const regex = createMeasurementRegex();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(recipeText)) !== null) {
    const originalQuantity = match[1];
    const originalUnit = match[2];
    const originalText = `${originalQuantity} ${originalUnit}`;
    const scaledValue = parseAmount(originalQuantity) * scale;
    const scaledText = `${formatMeasurement(scaledValue)} ${originalUnit}`;

    details.push({ originalText, scaledText });
  }

  return details;
}

export function scaleRecipeText(recipeText: string, scale: number): RecipeSegment[] {
  const segments: RecipeSegment[] = [];
  let lastIndex = 0;
  const regex = createMeasurementRegex();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(recipeText)) !== null) {
    const matchedText = match[0];
    const startIndex = match.index;
    const quantityString = match[1] || '';

    if (!quantityString) {
      continue;
    }

    const originalValue = parseAmount(quantityString);
    const scaledValue = originalValue * scale;
    const scaledText = matchedText.replace(quantityString, formatMeasurement(scaledValue));

    if (lastIndex < startIndex) {
      segments.push({ text: recipeText.slice(lastIndex, startIndex), isMeasurement: false });
    }

    segments.push({ text: scaledText, isMeasurement: true });
    lastIndex = startIndex + matchedText.length;
  }

  if (lastIndex < recipeText.length) {
    segments.push({ text: recipeText.slice(lastIndex), isMeasurement: false });
  }

  return segments;
}
