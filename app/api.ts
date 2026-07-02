import type { Card } from "./card";

export const fetchShuffledDeck = async (): Promise<Card[]> => {
  const shuffleResponse = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  );
  if (!shuffleResponse.ok) {
    throw new Error("Failed to shuffle a new deck.");
  }
  const { deck_id } = await shuffleResponse.json();

  const drawResponse = await fetch(
    `https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=52`
  );
  if (!drawResponse.ok) {
    throw new Error("Failed to draw cards from the deck.");
  }
  const { cards } = await drawResponse.json();

  return cards as Card[];
};
