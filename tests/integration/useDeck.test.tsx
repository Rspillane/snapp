import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDeck } from "../../app/game";
import { makeCard } from "../fixtures";

const jsonResponse = (body: unknown, ok = true) =>
  ({ ok, json: () => Promise.resolve(body) }) as Response;

const mockSuccessfulFetch = (cards: ReturnType<typeof makeCard>[]) => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(jsonResponse({ deck_id: "abc123" }))
    .mockResolvedValueOnce(jsonResponse({ cards }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("useDeck", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("loads a shuffled deck into `remaining` on mount", async () => {
    const cards = [makeCard("ACE", "SPADES"), makeCard("2", "HEARTS")];
    mockSuccessfulFetch(cards);

    const { result } = renderHook(() => useDeck());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.remaining).toEqual(cards);
    expect(result.current.drawn).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("moves a card into `revealed` immediately, then into `drawn` after the reveal delay", async () => {
    const cards = [makeCard("ACE", "SPADES"), makeCard("2", "HEARTS")];
    mockSuccessfulFetch(cards);

    const { result } = renderHook(() => useDeck());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.useFakeTimers();

    act(() => result.current.draw());
    expect(result.current.revealed).toEqual(cards[0]);
    expect(result.current.remaining).toEqual([cards[1]]);
    expect(result.current.drawn).toEqual([]);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.revealed).toBeNull();
    expect(result.current.drawn).toEqual([cards[0]]);
  });

  it("ignores draw() calls while a card is already revealed", async () => {
    const cards = [makeCard("ACE", "SPADES"), makeCard("2", "HEARTS"), makeCard("3", "CLUBS")];
    mockSuccessfulFetch(cards);

    const { result } = renderHook(() => useDeck());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.useFakeTimers();

    act(() => result.current.draw());
    act(() => result.current.draw());
    act(() => result.current.draw());

    expect(result.current.remaining).toEqual([cards[1], cards[2]]);
    expect(result.current.revealed).toEqual(cards[0]);
  });

  it("counts a suit match and a value match separately", async () => {
    const cards = [
      makeCard("ACE", "SPADES"),
      makeCard("2", "SPADES"), // same suit as ACE of Spades -> suit match
      makeCard("2", "HEARTS"), // same value as 2 of Spades -> value match
      makeCard("KING", "CLUBS"), // no match with 2 of Hearts
    ];
    mockSuccessfulFetch(cards);

    const { result } = renderHook(() => useDeck());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.useFakeTimers();

    for (let i = 0; i < cards.length; i++) {
      act(() => result.current.draw());
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(result.current.drawn).toEqual(cards);
    expect(result.current.suitMatches).toBe(1);
    expect(result.current.valueMatches).toBe(1);
  });

  it("sets an error and stops loading if the deck fails to load", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({}, false));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useDeck());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Couldn't load the deck. Please try again.");
    expect(result.current.remaining).toEqual([]);
  });

  it("clears the error and reloads the deck when retry() succeeds", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({}, false));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useDeck());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    const cards = [makeCard("ACE", "SPADES")];
    fetchMock.mockReset();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ deck_id: "xyz" }))
      .mockResolvedValueOnce(jsonResponse({ cards }));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.remaining).toEqual(cards);
  });
});
