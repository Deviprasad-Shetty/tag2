# tag2 — Toy Store demo 🚂

A small static demo of a toy store showing client-side tracking for analytics/testing purposes.

## Features ✅

- Simple product listing and cart UI (no backend) 
- Client-side tracking events: `page_view`, `add_to_cart`, `begin_checkout`, `purchase`
- Sends JSON events to a configurable tracking endpoint (uses `navigator.sendBeacon` when available)

## Quick start 🧪

1. Serve the `public/` folder locally:

   ```bash
   python3 -m http.server 8000
   # then open http://localhost:8000/public/ in your browser
   ```

2. Use the app: add items to the cart and checkout to see tracking events fire.

## Configure tracking 🔧

- Edit the tracking endpoint in `public/assets/js/script.js`:

  ```js
  // Replace with your collector URL
  const TRACKING_ENDPOINT = 'https://tracking.example.com/collect';
  ```

- For quick testing, use a request inspector (e.g. https://webhook.site) and paste the generated URL as `TRACKING_ENDPOINT`.

## File layout 📁

- `public/index.html` — store UI
- `public/thankyou.html` — confirmation page (sends `purchase` event)
- `public/assets/css/style.css` — styles
- `public/assets/js/script.js` — tracking and app logic

## Notes & tips 💡

- Events are sent as JSON: `{ event, payload, page, ts, ua }`.
- Consider adding consent handling in production before tracking.

## License

MIT — see `LICENSE` file.
