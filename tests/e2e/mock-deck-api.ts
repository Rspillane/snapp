import type { Page } from "@playwright/test";

export type MockCard = {
  code: string;
  value: string;
  suit: string;
};

export const card = (code: string, value: string, suit: string): MockCard => ({ code, value, suit });

const toApiCard = (c: MockCard) => ({
  code: c.code,
  value: c.value,
  suit: c.suit,
  image: `https://deckofcardsapi.com/static/img/${c.code}.png`,
});

/**
 * Intercepts the two Deck of Cards API calls the app makes, so tests are
 * deterministic and don't depend on the real third-party API being up.
 */
export const mockShuffleAndDraw = async (page: Page, cards: MockCard[], deckId = "test-deck") => {
  await page.route("**/api/deck/new/shuffle/**", route =>
    route.fulfill({ json: { deck_id: deckId } })
  );
  await page.route("**/api/deck/*/draw/**", route =>
    route.fulfill({ json: { cards: cards.map(toApiCard) } })
  );
};

export const mockShuffleFailure = async (page: Page, status = 500) => {
  await page.route("**/api/deck/new/shuffle/**", route =>
    route.fulfill({ status, body: "Internal Server Error" })
  );
};
