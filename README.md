# Passwise

GitHub Pages deployment runs automatically on pushes to `main`. The workflow checks formatting, runs tests, and builds with the repository's URL prefix before deploying `dist/`.

A mobile-first Chrome password sorter built with Vite, React, TypeScript, and Tailwind CSS v4. On desktop it stays in a centered, phone-sized layout.

## Run locally

```sh
npm install
npm run dev
```

`npm run build` checks TypeScript and creates `dist/`. `npm test` checks CSV import/export edge cases. `npm run preview` serves the production build.

Import a Chrome password CSV from Google Password Manager → Settings → Export passwords. Swipe right for important or left for unimportant, or use the buttons. Undo reverses the last decision. The overview shows counts and lets you resume. Export downloads separate CSVs retaining the original columns, including passwords and notes. Undecided accounts are excluded. Starting from scratch removes the saved session after confirmation.

Papa Parse handles CSV parsing and serialization; react-swipeable handles touch and mouse gestures; lucide-react supplies icons. Tailwind uses its official Vite plugin.

All imported data and decisions stay in localStorage on this browser/origin. No server, analytics, external fonts, favicons, or uploads are used. Browser storage and downloaded CSVs are **not encrypted**. Use a trusted device and remove CSV files when finished. Clearing browser storage also clears progress.
Keyboard shortcuts on the review screen: **A / Left Arrow** marks unimportant, **D / Right Arrow** marks important, and **S / Down Arrow** goes back by undoing the last decision. Holding a key does not classify multiple accounts.
