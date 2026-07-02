import type { ComponentPropsWithoutRef } from "react";
import cardBack from "../../assets/card-back.png";
import styles from "./Deck.module.css";

type DeckProps = ComponentPropsWithoutRef<"div">;

export const Deck = (props: DeckProps) => {
  return (
    <div className={styles.deck} {...props}>
      <img src={cardBack} alt="Deck" className={styles.image} />
    </div>
  );
};
