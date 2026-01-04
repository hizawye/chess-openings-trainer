import type { Opening, Variation } from '../../types';
import italianGame from './italian-game.json';
import sicilianDefense from './sicilian-defense.json';
import frenchDefense from './french-defense.json';
import queensGambit from './queens-gambit.json';
import ruyLopez from './ruy-lopez.json';
import caroKannDefense from './caro-kann-defense.json';
import kingsIndianDefense from './kings-indian-defense.json';
import nimzoIndianDefense from './nimzo-indian-defense.json';
import petrovsDefense from './petrovs-defense.json';
import scandinavianDefense from './scandinavian-defense.json';
import englishOpening from './english-opening.json';
import londonSystem from './london-system.json';
import grunfeldDefense from './grunfeld-defense.json';
import catalanOpening from './catalan-opening.json';
import kingsIndianAttack from './kings-indian-attack.json';
import pircDefense from './pirc-defense.json';
import alekhinesDefense from './alekhines-defense.json';
import viennaGame from './vienna-game.json';
import scotchGame from './scotch-game.json';
import dutchDefense from './dutch-defense.json';
import benoniDefense from './benoni-defense.json';
import twoKnightsDefense from './two-knights-defense.json';
import tarraschDefense from './tarrasch-defense.json';
import benkoGambit from './benko-gambit.json';
import retiOpening from './reti-opening.json';
import queensIndianDefense from './queens-indian-defense.json';
import bogoIndianDefense from './bogo-indian-defense.json';
import oldIndianDefense from './old-indian-defense.json';
import kingsGambit from './kings-gambit.json';
import modernDefense from './modern-defense.json';
import philidorDefense from './philidor-defense.json';
import torreAttack from './torre-attack.json';
import trompowskyAttack from './trompowsky-attack.json';
import colleSystem from './colle-system.json';
import stonewallAttack from './stonewall-attack.json';
import blackmarDiemerGambit from './blackmar-diemer-gambit.json';
import budapestGambit from './budapest-gambit.json';
import fourKnightsGame from './four-knights-game.json';
import birdsOpening from './birds-opening.json';
import centerGame from './center-game.json';

// Type assertion for JSON imports
const openings: Opening[] = [
  italianGame as Opening,
  sicilianDefense as Opening,
  frenchDefense as Opening,
  queensGambit as Opening,
  ruyLopez as Opening,
  caroKannDefense as Opening,
  kingsIndianDefense as Opening,
  nimzoIndianDefense as Opening,
  petrovsDefense as Opening,
  scandinavianDefense as Opening,
  englishOpening as Opening,
  londonSystem as Opening,
  grunfeldDefense as Opening,
  catalanOpening as Opening,
  kingsIndianAttack as Opening,
  pircDefense as Opening,
  alekhinesDefense as Opening,
  viennaGame as Opening,
  scotchGame as Opening,
  dutchDefense as Opening,
  benoniDefense as Opening,
  twoKnightsDefense as Opening,
  tarraschDefense as Opening,
  benkoGambit as Opening,
  retiOpening as Opening,
  queensIndianDefense as Opening,
  bogoIndianDefense as Opening,
  oldIndianDefense as Opening,
  kingsGambit as Opening,
  modernDefense as Opening,
  philidorDefense as Opening,
  torreAttack as Opening,
  trompowskyAttack as Opening,
  colleSystem as Opening,
  stonewallAttack as Opening,
  blackmarDiemerGambit as Opening,
  budapestGambit as Opening,
  fourKnightsGame as Opening,
  birdsOpening as Opening,
  centerGame as Opening,
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
