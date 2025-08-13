# AI-Ethics-Suitcase

An interactive application for exploring linear classifiers and key classification metrics, including true positives, false positives, true negatives, and false negatives. This tool demonstrates how AI models inevitably produce incorrect classifications, providing a hands-on way to understand the ethical implications of these errors.

## Configuration

A config file (`public/config.json`) is loaded before the application is started. It supports the following keys:

- **defaultLanguage** (string, default: "en"): Default language to use.
- **startLevel** (number, default: -1): Starting level.

## Development and Building

The application is built using React + Vite, powered by tailwind-css for styling and typescript.

### Prerequisites

Make sure that **node** and **npm** (or [**pnpm**](https://pnpm.io/)) is installed.

### Running locally (dev mode)

_Instead of using pnpm, you can also use npm. However pnpm is preferred since it is much faster and efficient._

```
pnpm i
pnpm run dev
```

### Building

You can compile the application, which can be then be accessed in from the `dist/` folder.

```
pnpm run build
```

To preview the built version, you can run

```
pnpm run preview
```


## Internationalization

To add a new translation, the following steps are necessary:
- Figure out the language code for the language you want to add, e.g. `eo` for Esperanto.
- Copy a locale file from `tr/` for a language you are familiar with and rename its basename to match the new language code, e.g. copy `tr/en.json` to `tr/eo.json`.
- Translate all the texts in the new locale file. Preserve whitespace.
- Update the `intlayer.config.ts` file. For e.g. add `Locales.ESPERANTO` to locales array. 
- Add the import to the `tr/index.ts` file and update the object being exported. For e.g. adding `import eoTranslations from './eo.json'` and adding a new value of `eo: eoTranslations`.
