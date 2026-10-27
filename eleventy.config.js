import { I18nPlugin } from "@11ty/eleventy";

import languages from "./src/_data/languages.js";
import contentTypes from "./src/_data/contentTypes.js";
import i18n from "./src/_data/i18n.js";

const DEFAULT_LANGUAGE = "en-us";
const languageCodes = languages.map((language) => language.code);

// Tags Eleventy uses internally that aren't content types.
const RESERVED_TAGS = ["posts"];

function getContentTypes(tags) {
  return (tags || []).filter((tag) => !RESERVED_TAGS.includes(tag));
}

// Fail the build early on a typo'd content type.
function validatePost(post) {
  for (let type of getContentTypes(post.data.tags)) {
    if (!contentTypes[type]) {
      throw new Error(
        `${post.inputPath}: unknown content type "${type}". Add it to src/_data/contentTypes.js or use one of: ${Object.keys(contentTypes).join(", ")}.`,
      );
    }
  }
}

export default function (eleventyConfig) {
  eleventyConfig.addBundle("css");
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addPlugin(I18nPlugin, {
    defaultLanguage: DEFAULT_LANGUAGE,
    errorMode: "allow-fallback",
  });

  // Post dates are UTC midnight; format in UTC so they don't shift a day.
  eleventyConfig.addFilter("isoDate", (date) =>
    new Date(date).toISOString().slice(0, 10),
  );

  // One entry per language + content type that has posts, used to paginate tag pages.
  eleventyConfig.addCollection("contentTypePages", (collectionApi) => {
    let posts = collectionApi.getFilteredByTag("posts");
    posts.forEach(validatePost);

    let pages = [];
    for (let lang of languageCodes) {
      for (let type of Object.keys(contentTypes)) {
        let typedPosts = posts.filter(
          (post) =>
            post.data.page.lang === lang &&
            getContentTypes(post.data.tags).includes(type),
        );
        if (typedPosts.length > 0) {
          pages.push({ lang, type, posts: typedPosts });
        }
      }
    }
    return pages;
  });

  // Translations share a file name and are the same post, so list each post once,
  // preferring the default language, then the order in `languages.js`.
  eleventyConfig.addCollection("uniquePosts", (collectionApi) => {
    let posts = collectionApi.getFilteredByTag("posts");
    let preference = [
      DEFAULT_LANGUAGE,
      ...languageCodes.filter((code) => code !== DEFAULT_LANGUAGE),
    ];
    let rank = (post) => preference.indexOf(post.data.page.lang);

    let chosen = new Map();
    for (let post of posts) {
      let current = chosen.get(post.data.page.fileSlug);
      if (!current || rank(post) < rank(current)) {
        chosen.set(post.data.page.fileSlug, post);
      }
    }
    return posts.filter((post) => chosen.get(post.data.page.fileSlug) === post);
  });

  eleventyConfig.addFilter("contentTypes", getContentTypes);

  // Translate an interface string from `src/_data/i18n.js`.
  eleventyConfig.addFilter("t", function (key, lang) {
    lang = lang || this.page?.lang || DEFAULT_LANGUAGE;
    return i18n[lang]?.[key] ?? key;
  });

  eleventyConfig.addFilter("contentTypeLabel", function (type, lang) {
    lang = lang || this.page?.lang || DEFAULT_LANGUAGE;
    return contentTypes[type]?.[lang] ?? type;
  });

  eleventyConfig.addFilter(
    "languageLabel",
    (code) => languages.find((language) => language.code === code)?.label ?? code,
  );

  return {
    dir: {
      input: "src",
    },
  };
}
