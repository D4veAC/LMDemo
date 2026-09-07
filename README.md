# LeadsMapping

A single-page React portfolio prototype for lead prioritization. All four records are synthetic. No personal information, model API, database, authentication, admission decisions, or feature-level explanations are included.

## Run locally

Requires Node.js 22.13 or later.

    npm install
    npm run dev

Open the local URL printed by the server. `npm run build` validates the production build.

## Editable files

- `app/page.tsx`: reusable components, synthetic data, and local demo interactions.
- `app/globals.css`: responsive layout and visual tokens.
- `app/layout.tsx`: document metadata.
- `exports/LeadsMapping-2880x1800.png`: 2× export of the 1440 × 900 viewport.

Search, category filters, record selection, and review buttons run in the browser. Review and call-queue changes are saved in localStorage on this browser; they are not shared between users or devices. Clear site storage to restore the screenshot state. No actions make a phone call or send data anywhere.

The supplied metrics are model-level context, not individual enrollment probabilities or validated explanations. The confidence and category probabilities are reproduced as provided in the brief.

This app is configured for Sites deployment. Predictions are supplied synthetic records, not a connected machine-learning service.
