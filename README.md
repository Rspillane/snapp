# Snapp

A Snap card game built with React and Vite, using the [Deck of Cards API](https://deckofcardsapi.com/) to shuffle and draw a 52-card deck.

Deployed here via vercel -> https://snapp-orpin.vercel.app/

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Testing

This project has three layers of tests, under `tests/`:

- **Unit** (`tests/unit`) — pure functions in isolation: `drawCard`, and `fetchShuffledDeck`'s error handling (via a mocked `fetch`).
- **Integration** (`tests/integration`) — the `useDeck` hook (Vitest + React Testing Library), with a mocked `fetch` and fake timers, covering the draw → reveal → settle flow, suit/value match counting, and the error/retry path.
- **End-to-end** (`tests/e2e`) — [Playwright](https://playwright.dev/), driving a real browser against the running app. The Deck of Cards API is intercepted via `page.route()`, so these tests are deterministic and don't depend on the third-party API being reachable.

One-time setup, after `npm install`:

```bash
npx playwright install chromium
```

Then, to run everything:

```bash
# Unit + integration tests (Vitest)
npm run test

# Unit + integration tests, watch mode
npm run test:watch

# End-to-end tests (Playwright) — starts the dev server automatically
npm run test:e2e
```
