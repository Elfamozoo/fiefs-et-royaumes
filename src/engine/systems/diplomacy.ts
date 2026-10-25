/**
 * Fiefs & Royaumes - Diplomacy & Feudal Relations System
 *
 * Implements vassalage, oaths of fealty, monthly tributes,
 * diplomatic pigeon messages, and the public rumor board of Terres de Kald.
 */

import type { GameState, Lord, Message, Rumor } from '../types';

/**
 * Binds a vassal lord to a suzerain lord under an oath of fealty.
 * Pure immutable transformation.
 */
export function swearFealty(
  state: GameState,
  vassalId: string,
  suzerainId: string
): GameState {
  const vassal = state.lords[vassalId];
  const suzerain = state.lords[suzerainId];

  if (!vassal || !suzerain || vassalId === suzerainId) {
    return state;
  }

  // Remove vassal from any previous suzerain's vassal list
  const nextLords = { ...state.lords };
  if (vassal.suzerainId && nextLords[vassal.suzerainId]) {
    const oldSuzerain = nextLords[vassal.suzerainId];
    nextLords[vassal.suzerainId] = {
      ...oldSuzerain,
      vassals: oldSuzerain.vassals.filter(id => id !== vassalId),
    };
  }

  // Update vassal
  nextLords[vassalId] = {
    ...vassal,
    suzerainId,
  };

  // Update suzerain
  const currentVassals = nextLords[suzerainId].vassals;
  if (!currentVassals.includes(vassalId)) {
    nextLords[suzerainId] = {
      ...nextLords[suzerainId],
      vassals: [...currentVassals, vassalId],
    };
  }

  return {
    ...state,
    lords: nextLords,
  };
}

/**
 * Releases a vassal from servitude, restoring independence.
 * Pure immutable transformation.
 */
export function releaseVassal(
  state: GameState,
  vassalId: string
): GameState {
  const vassal = state.lords[vassalId];
  if (!vassal || !vassal.suzerainId) return state;

  const suzerainId = vassal.suzerainId;
  const suzerain = state.lords[suzerainId];

  const nextLords = { ...state.lords };

  nextLords[vassalId] = {
    ...vassal,
    suzerainId: null,
  };

  if (suzerain) {
    nextLords[suzerainId] = {
      ...suzerain,
      vassals: suzerain.vassals.filter(id => id !== vassalId),
    };
  }

  return {
    ...state,
    lords: nextLords,
  };
}

/**
 * Processes monthly feudal tributes.
 * Each vassal transfers a percentage of their treasury gold to their suzerain.
 */
export function processVassalTributes(
  state: GameState,
  tributeRate: number = 0.10
): GameState {
  const nextLords: Record<string, Lord> = {};
  for (const [id, lord] of Object.entries(state.lords)) {
    nextLords[id] = { ...lord };
  }

  for (const lord of Object.values(state.lords)) {
    if (lord.suzerainId && nextLords[lord.suzerainId]) {
      const tribute = Math.floor(lord.gold * tributeRate);
      if (tribute > 0) {
        nextLords[lord.id].gold -= tribute;
        nextLords[lord.suzerainId].gold += tribute;
      }
    }
  }

  return {
    ...state,
    lords: nextLords,
  };
}

/**
 * Dispatches a diplomatic pigeon carrying a sealed message between lords.
 */
export function sendPigeonMessage(
  state: GameState,
  fromLordId: string,
  toLordId: string,
  content: string
): GameState {
  const newMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fromLordId,
    toLordId,
    content,
    month: state.month,
    read: false,
  };

  return {
    ...state,
    messages: [newMessage, ...state.messages],
  };
}

/**
 * Publishes a rumor to the public forum / tavern whispers.
 */
export function postPublicRumor(
  state: GameState,
  authorId: string,
  text: string
): GameState {
  const author = state.lords[authorId];
  const newRumor: Rumor = {
    id: `rumor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    authorId,
    authorName: author?.name ?? 'Anonyme',
    text,
    month: state.month,
    season: state.season,
  };

  return {
    ...state,
    rumors: [newRumor, ...state.rumors],
  };
}
