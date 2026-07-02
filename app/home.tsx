import { useEffect, useRef } from "react";
import type { Route } from "./+types/home";
import { Deck } from "./components/Deck/Deck";
import { DiscardPile } from "./components/DiscardPile/DiscardPile";
import { RevealedCard } from "./components/RevealedCard/RevealedCard";
import { useDeck } from "./game";
import styles from "./home.module.css";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Snapp" },
    { name: "description", content: "Snapp" },
  ];
};

const Home = () => {
  // Get game logic and state fro useDeck hook
  const { remaining, drawn, revealed, draw, loading, error, retry, suitMatches, valueMatches } = useDeck();
  
  const topCard = drawn[drawn.length - 1];
  const drawButtonRef = useRef<HTMLButtonElement>(null);
  const isDrawDisabled = loading || remaining.length === 0 || revealed !== null;
  const isGameOver = !loading && !error && drawn.length > 0 && remaining.length === 0 && revealed === null;

  // Focus the draw button when it becomes enabled
  useEffect(() => {
    if (!isDrawDisabled) {
      drawButtonRef.current?.focus();
    }
  }, [isDrawDisabled]);

  const message =
    revealed && topCard && revealed.suit === topCard.suit
      ? "Snap suit!"
      : revealed && topCard && revealed.value === topCard.value
        ? "Snap value!"
        : null;

  // For aria live region for non sighted users.
  const announcement = revealed
    ? `Drew ${revealed.value} of ${revealed.suit}. ${message ?? "No match."}`
    : "";

  // While a card is mid-reveal it has already left `remaining`, but it hasn't
  // settled into `drawn` yet either. Counting it back in here keeps the chance
  // stable through the reveal, so it only updates once topCard actually changes.
  const remainingForChance = revealed ? [...remaining, revealed] : remaining;

  const suitChance =
    topCard && remainingForChance.length > 0
      ? (remainingForChance.filter(card => card.suit === topCard.suit).length / remainingForChance.length) * 100
      : 0;

  const valueChance =
    topCard && remainingForChance.length > 0
      ? (remainingForChance.filter(card => card.value === topCard.value).length / remainingForChance.length) * 100
      : 0;

  return (
    <div className={styles.page}>
      {error && (
        <div className={styles.errorBanner} role="alert">
          <p>{error}</p>
          <button type="button" className={styles.drawButton} onClick={retry}>
            Retry
          </button>
        </div>
      )}
       <p className={styles.message}>{message}</p>
       {/* Visually hidden status message for screen readers */}
      <p className={styles.visuallyHidden} role="status" aria-live="polite">
        {announcement}
      </p>
      <p className={styles.stats}>
        Suit matches: {suitMatches}
      </p>
      <p className={styles.stats}>
        Value matches: {valueMatches}
      </p>
      <p className={styles.chance}>
        Chance of suit match: {suitChance.toFixed(1)}% |
        Chance of value match: {valueChance.toFixed(1)}%
      </p>
     
      <div className={styles.row}>
        <DiscardPile cards={drawn} />
        <div style={{width: 120}} />
        <div className={styles.deckWrapper}>
          <p className={styles.remainingCount}>{remaining.length} cards remaining</p>
          <div className={styles.deckColumn}>
            {remaining.length > 0 && <Deck />}

            {revealed && (
              <div className={styles.revealedSlot}>
                <RevealedCard key={revealed.code} card={revealed} />
              </div>
            )}
          </div>
        </div>
        
        
      </div>
          <button
            ref={drawButtonRef}
            type="button"
            className={styles.drawButton}
            onClick={draw}
            disabled={isDrawDisabled}
          >
            Draw Card
          </button>

{/* Restart Game Button */}
          {isGameOver && (
            <button
              type="button"
              className={styles.drawButton}
              onClick={() => window.location.reload()}
            >
              Restart Game
            </button>
          )}
    </div>
  );
};

export default Home;
