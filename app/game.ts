import { useEffect, useState } from "react";
import type { Card } from "./card";
import { fetchShuffledDeck } from "./deck";

export const drawCard = (deck: Card[]): { card: Card; remaining: Card[] } => {
  const [card, ...remaining] = deck;
  return { card, remaining };
};

const REVEAL_DELAY_MS = 1000;

export const useDeck = () => {
  const [remaining, setRemaining] = useState<Card[]>([]);
  const [drawn, setDrawn] = useState<Card[]>([]);
  const [revealed, setRevealed] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [suitMatches, setSuitMatches] = useState(0);
  const [valueMatches, setValueMatches] = useState(0);

  useEffect(() => {
    fetchShuffledDeck().then(cards => {
      setRemaining(cards);
      setLoading(false);
    });
  }, []);

  const draw = () => {
    if (revealed) return;
    setRemaining(current => {
      if (current.length === 0) return current;
      const { card, remaining: rest } = drawCard(current);
      setRevealed(card);
      return rest;
    });
  };

  useEffect(() => {
    if (!revealed) return;
    const timeout = setTimeout(() => {
      const previous = drawn[drawn.length - 1];
      if (previous) {
        if (previous.suit === revealed.suit) setSuitMatches(count => count + 1);
        else if (previous.value === revealed.value) setValueMatches(count => count + 1);
      }
      setDrawn(d => [...d, revealed]);
      setRevealed(null);
    }, REVEAL_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [revealed, drawn]);

  return { remaining, drawn, revealed, draw, loading, suitMatches, valueMatches };
};
