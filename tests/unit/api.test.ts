import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchShuffledDeck } from "../../app/api";
import { makeCard } from "../fixtures";

const jsonResponse = (body: unknown, ok = true) =>
  ({ ok, json: () => Promise.resolve(body) }) as Response;

describe("fetchShuffledDeck", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shuffles a deck then draws 52 cards from it", async () => {
    const cards = [makeCard("ACE", "SPADES"), makeCard("2", "HEARTS")];
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ deck_id: "abc123" }))
      .mockResolvedValueOnce(jsonResponse({ cards }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchShuffledDeck();

    expect(result).toEqual(cards);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://deckofcardsapi.com/api/deck/abc123/draw/?count=52"
    );
  });

  it("throws if the shuffle request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({}, false));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchShuffledDeck()).rejects.toThrow("Failed to shuffle a new deck.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws if the draw request fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ deck_id: "abc123" }))
      .mockResolvedValueOnce(jsonResponse({}, false));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchShuffledDeck()).rejects.toThrow("Failed to draw cards from the deck.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("propagates a network failure", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchShuffledDeck()).rejects.toThrow("network down");
  });
});
