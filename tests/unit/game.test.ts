import { describe, expect, it } from "vitest";
import { drawCard } from "../../app/game";
import { makeCard } from "../fixtures";

describe("drawCard", () => {
  it("pops the first card off the deck and returns the rest", () => {
    const deck = [makeCard("ACE", "SPADES"), makeCard("2", "HEARTS"), makeCard("KING", "CLUBS")];

    const { card, remaining } = drawCard(deck);

    expect(card).toEqual(deck[0]);
    expect(remaining).toEqual([deck[1], deck[2]]);
  });

  it("does not mutate the original deck array", () => {
    const deck = [makeCard("ACE", "SPADES"), makeCard("2", "HEARTS")];
    const originalLength = deck.length;

    drawCard(deck);

    expect(deck).toHaveLength(originalLength);
  });

  it("handles a single-card deck, leaving an empty remainder", () => {
    const deck = [makeCard("QUEEN", "DIAMONDS")];

    const { card, remaining } = drawCard(deck);

    expect(card).toEqual(deck[0]);
    expect(remaining).toEqual([]);
  });
});
