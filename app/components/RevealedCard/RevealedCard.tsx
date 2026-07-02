import cardBack from "../../assets/card-back.png";
import type { Card } from "../../card";
import styles from "./RevealedCard.module.css";

type RevealedCardProps = {
  card: Card;
};

export const RevealedCard = ({ card }: RevealedCardProps) => {
  return (
    <div className={styles.revealedCard}>
      <div className={styles.flipper}>
        <div className={`${styles.face} ${styles.back}`}>
          <img className={styles.image} src={cardBack} alt="" />
        </div>
        <div className={`${styles.face} ${styles.front}`}>
          <img
            className={styles.image}
            src={card.image}
            alt={`${card.value} of ${card.suit}`}
          />
        </div>
      </div>
    </div>
  );
};
