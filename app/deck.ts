import type { Card } from "./card";

export const fetchShuffledDeck = async (): Promise<Card[]> => {
  const { deck_id } = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  ).then(r => r.json());

  const { cards } = await fetch(
    `https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=52`
  ).then(r => r.json());

  return cards as Card[];
};
