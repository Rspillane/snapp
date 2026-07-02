import { useEffect, useRef, useState } from "react";
import type { Card } from "./card";
import { fetchShuffledDeck } from "./api";

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
  const [error, setError] = useState<string | null>(null);
  const [suitMatches, setSuitMatches] = useState(0);
  const [valueMatches, setValueMatches] = useState(0);

  // Guards against a stale response clobbering state if loadDeck() is called
  // again (e.g. React StrictMode's double-invoked mount effect, or a fast
  // Retry click) before an earlier request has resolved.
  const requestIdRef = useRef(0);

  const loadDeck = () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    fetchShuffledDeck()
      .then(cards => {
        if (requestIdRef.current !== requestId) return;
        setRemaining(cards);
        setLoading(false);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setError("Couldn't load the deck. Please try again.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDeck();
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

  return { remaining, drawn, revealed, draw, loading, error, retry: loadDeck, suitMatches, valueMatches };
};
