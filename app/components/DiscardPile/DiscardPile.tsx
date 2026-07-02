import type { Card } from "../../card";
import styles from "./DiscardPile.module.css";

type DiscardPileProps = {
  cards: Card[];
};

// Deterministic 0..1 pseudo-random value so the stack looks the same across re-renders.
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const DiscardPile = ({ cards }: DiscardPileProps) => {
  if (cards.length === 0) {
    return <div className={styles.discardPile}>Discard Pile</div>;
  }

  return (
    <div className={styles.discardPile}>
      {cards.map((card, index) => {
        const translateX = (pseudoRandom(index + 1) - 0.5) * 2;
        const translateY = (pseudoRandom(index + 51) - 0.5) * 2;
        const rotate = (pseudoRandom(index + 101) - 0.5) * 4;

        return (
          <img
            key={card.code}
            className={styles.image}
            src={card.image}
            alt={`${card.value} of ${card.suit}`}
            style={{
              transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`,
              zIndex: index,
            }}
          />
        );
      })}
    </div>
  );
};
