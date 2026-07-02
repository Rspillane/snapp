import type { Card } from "../app/card";

export const makeCard = (value: Card["value"], suit: Card["suit"]): Card => ({
  code: `${value[0]}${suit[0]}`,
  value,
  suit,
  image: `https://deckofcardsapi.com/static/img/${value[0]}${suit[0]}.png`,
});
