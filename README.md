# site

this is my personal website

## writing posts

posts live in a language folder: `src/blog/posts/pt-br/`, `src/blog/posts/en-us/` or `src/blog/posts/fr-fr/`, and are published at `/<lang>/blog/<file-name>/`. `/blog/` lists each post once (english version when there is one).

```md
---
title: "my post"
date: 2026-10-13
tags: [tutorial, til]
---
```

- **translations**: use the same file name in another language folder; posts link to their translations automatically.
- **content types**: append keys from `src/_data/contentTypes.js` to `tags`. each type gets a page per language at `/<lang>/blog/tags/<type>/`. unknown types fail the build; add new ones to `contentTypes.js` with a label per language.
- interface strings live in `src/_data/i18n.js`, languages in `src/_data/languages.js`.
