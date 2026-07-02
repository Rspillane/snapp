import { expect, test } from "@playwright/test";
import { card, mockShuffleAndDraw } from "./mock-deck-api";

const MID_REVEAL_MS = 300;
const REVEAL_SETTLE_MS = 1300;

test("draws through a full deck, showing matches, and restarts", async ({ page }) => {
  const cards = [
    card("AS", "ACE", "SPADES"),
    card("2S", "2", "SPADES"), // same suit as AS -> suit match
    card("KC", "KING", "CLUBS"), // no match with 2S
  ];
  await mockShuffleAndDraw(page, cards);

  await page.goto("/");
  await expect(page.getByText("3 cards remaining")).toBeVisible();

  const drawButton = page.getByRole("button", { name: "Draw Card" });
  const remainingCount = page.getByText(/cards remaining/);

  // Draw 1: Ace of Spades, no previous card to match against
  await drawButton.click();
  await page.waitForTimeout(REVEAL_SETTLE_MS);
  await expect(remainingCount).toHaveText("2 cards remaining");
  await expect(page.getByRole("button", { name: "Restart Game" })).toHaveCount(0);

  // Draw 2: 2 of Spades -> same suit as the Ace -> snap suit.
  // The message only shows while the card is mid-reveal, so check it before
  // the reveal settles (at which point it clears back to blank).
  await drawButton.click();
  await page.waitForTimeout(MID_REVEAL_MS);
  await expect(page.getByText("Snap suit!", { exact: true })).toBeVisible();
  await page.waitForTimeout(REVEAL_SETTLE_MS - MID_REVEAL_MS);
  await expect(remainingCount).toHaveText("1 cards remaining");

  // Draw 3 (final card): King of Clubs -> no match, deck now empty
  await drawButton.click();
  await page.waitForTimeout(REVEAL_SETTLE_MS);
  await expect(remainingCount).toHaveText("0 cards remaining");
  await expect(drawButton).toBeDisabled();

  const restartButton = page.getByRole("button", { name: "Restart Game" });
  await expect(restartButton).toBeVisible();

  // Restarting reloads the page and loads a fresh deck
  await restartButton.click();
  await expect(page.getByText("3 cards remaining")).toBeVisible();
  await expect(page.getByRole("button", { name: "Restart Game" })).toHaveCount(0);
});
