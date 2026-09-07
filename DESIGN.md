# LeadsMapping design contract

## Surface and typography

Single local portfolio dashboard, optimized for a 1440 × 900 screenshot. Dense synthetic lead queue on the left; a more spacious prediction and human-review action on the right. White cards on a cool neutral background. No decorative imagery, gradients, or logos.

`--font-display` and `--font-body` use the system-compatible sans-serif stack requested by the brief. No serif seed is bound. Body text is at least 16px; secondary metadata may be 12–14px.

## Color contract

All colors and shadows are defined in `:root` in `app/globals.css`.

- `--accent: #245edb` is reserved for two visible areas: the selected prediction and primary call-queue action.
- Secondary controls, table selection, and brand mark use neutral tokens.
- Medium categories use amber tokens. Category text and directional indicators ensure color is never the only signal.
- No rounded card receives a colored left-border accent.
- SVG icons use currentColor and 1.7px strokes.

## Content and review

Preserve all supplied metrics, example probabilities, review status, responsible-use notice, and development disclosure. Additional lead values are visibly labeled synthetic. Do not add feature attribution, admission decisions, personal information, or unsupported performance claims.

Stable `data-od-id` attributes identify the header, queue, detail, prediction, probabilities, recommendation, model context, responsible-use notice, and footer.

The upstream daemon `lint-artifact` is not present in this repository. Local checks are not a substitute for that linter.
