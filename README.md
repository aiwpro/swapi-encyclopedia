## Star Wars Encyclopedia

Mobile-first Star Wars character encyclopedia using Next.js, React, TypeScript, Apollo Client, GraphQL (SWAPI), and Tailwind CSS.

### Tech Stack
- Next.js (App Router) + React + TypeScript
- Apollo Client + GraphQL
- Tailwind CSS

### Getting Started
1. Install dependencies:
```bash
npm install
```
2. Run the dev server:
```bash
npm run dev
```
Open http://localhost:3000.

### Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm start` — start production server

### Project Structure
- `src/app/page.tsx` — character list with search and sort
- `src/app/character/[id]/page.tsx` — character details
- `src/lib/apollo-client.ts` — Apollo Client setup
- `src/app/layout.tsx` — global layout and providers

### Notes
- Data source: SWAPI GraphQL (`https://swapi-graphql.netlify.app/.netlify/functions/index`).
- The UI is built mobile-first and responsive via Tailwind utility classes.
