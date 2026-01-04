import type { Opening, Variation } from '../../types';
import italianGame from './italian-game.json';
import sicilianDefense from './sicilian-defense.json';
import frenchDefense from './french-defense.json';
import queensGambit from './queens-gambit.json';
import ruyLopez from './ruy-lopez.json';

// Type assertion for JSON imports
const openings: Opening[] = [
  italianGame as Opening,
  sicilianDefense as Opening,
  frenchDefense as Opening,
  queensGambit as Opening,
  ruyLopez as Opening,
];

export { openings };

export function getOpeningById(id: string): Opening | undefined {
  return openings.find((opening) => opening.id === id);
}

export function getVariationById(
  openingId: string,
  variationId: string
): { opening: Opening; variation: Variation } | undefined {
  const opening = getOpeningById(openingId);
  if (!opening) return undefined;

  // Search in main variations
  const variation = findVariation(opening.variations, variationId);
  if (variation) {
    return { opening, variation };
  }

  return undefined;
}

function findVariation(variations: Variation[], id: string): Variation | undefined {
  for (const variation of variations) {
    if (variation.id === id) {
      return variation;
    }
    if (variation.subVariations) {
      const found = findVariation(variation.subVariations, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function getAllVariations(opening: Opening): Variation[] {
  const result: Variation[] = [];

  function collect(variations: Variation[]) {
    for (const v of variations) {
      result.push(v);
      if (v.subVariations) {
        collect(v.subVariations);
      }
    }
  }

  collect(opening.variations);
  return result;
}

export function getOpeningsByColor(color: 'white' | 'black'): Opening[] {
  return openings.filter((opening) => opening.color === color);
}

export function searchOpenings(query: string): Opening[] {
  const lowerQuery = query.toLowerCase();
  return openings.filter(
    (opening) =>
      opening.name.toLowerCase().includes(lowerQuery) ||
      opening.eco.toLowerCase().includes(lowerQuery) ||
      opening.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export default openings;
