export interface Card {
  code: string;
  suit: "SPADES" | "CLUBS" | "HEARTS" | "DIAMONDS";
  value:
    | "ACE"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "JACK"
    | "QUEEN"
    | "KING";
  image: string;
}
