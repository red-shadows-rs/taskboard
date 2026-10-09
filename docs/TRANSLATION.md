# Local Translation

TaskBoard stores every title and description as a pair of languages
(`{ en, ar }`). The forms expose a single input in the active UI language and
fill the other language automatically with a machine translation that runs
entirely on the local CPU. No text leaves the machine and no cloud translation
API is used.

## How it works

1. The form shows one input in the current interface language.
2. On submit, the client inspects the script of the typed text.
3. If translation is needed, the client calls `POST /api/translate`.
4. The server translates with a local ONNX model and returns the text.
5. The client stores `{ en, ar }` and submits the entity.

If the translation request fails, the typed value is stored in both languages
and the save still succeeds.

## The language rule

| UI language | Typed text | Result                                  |
| ----------- | ---------- | --------------------------------------- |
| Arabic      | Arabic     | `ar` = typed, `en` = translated (ar→en) |
| Arabic      | Latin      | `ar` = typed, `en` = typed (as-is)      |
| English     | Latin      | `en` = typed, `ar` = translated (en→ar) |
| English     | Arabic     | `en` = typed, `ar` = typed (as-is)      |

Balanced mixed text is stored as-is. Digits, punctuation, URLs and isolated
brand tokens are ignored when deciding the dominant script.

## Rich text

Task descriptions are rich text. Only the text nodes are translated; bold,
italic, lists, links and alignment are preserved. Text inside `code`, `pre`,
`script` and `style` is never translated.

## Model

- **Engine**: `Xenova/nllb-200-distilled-600M` (ONNX, int8) via
  `@huggingface/transformers`.
- **Runtime**: Node.js (CPU only), loaded once and cached in memory.
- **Direction**: configured by FLORES-200 codes in `translation.config.json`.
- **Download size**: roughly 900 MB, stored in `models/` (git-ignored).

## Setup

```bash
npm install
npm run models:download
```

`npm run models:download` caches the model under `models/`. At runtime the
app loads only from disk (`allowRemoteModels` is disabled), so it works fully
offline.

## Configuration

| Variable                 | Default    | Description                       |
| ------------------------ | ---------- | --------------------------------- |
| `TRANSLATION_ENABLED`    | `true`     | Disable translation entirely.     |
| `TRANSLATION_MODELS_DIR` | `./models` | Directory holding the ONNX model. |

Model id, quantization and language codes live in `translation.config.json` so
the downloader and the runtime never drift apart.

## API

`POST /api/translate` (authenticated, rate-limited)

```json
{ "segments": ["text"], "from": "ar", "to": "en" }
```

Response:

```json
{ "translations": ["translated text"] }
```

Returns `503` with `code: "translation_unavailable"` when the model is missing
or translation is disabled; the client then stores the text as-is.
