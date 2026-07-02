import { expect, test } from "@playwright/test";
import { card, mockShuffleAndDraw, mockShuffleFailure } from "./mock-deck-api";

test("shows an error banner on API failure, and recovers via Retry", async ({ page }) => {
  await mockShuffleFailure(page);

  await page.goto("/");

  const errorBanner = page.getByRole("alert");
  await expect(errorBanner).toContainText("Couldn't load the deck");

  const drawButton = page.getByRole("button", { name: "Draw Card" });
  await expect(drawButton).toBeDisabled();

  // API recovers; clicking Retry should now succeed
  await mockShuffleAndDraw(page, [card("AS", "ACE", "SPADES")]);
  await page.getByRole("button", { name: "Retry" }).click();

  await expect(errorBanner).toHaveCount(0);
  await expect(page.getByText("1 cards remaining")).toBeVisible();
  await expect(drawButton).toBeEnabled();
});
