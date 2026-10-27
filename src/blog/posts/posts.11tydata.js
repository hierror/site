import languages from "../../_data/languages.js";

const languageCodes = languages.map((language) => language.code);

export default {
  layout: "layouts/post.html",
  tags: "posts",
  // src/blog/posts/<lang>/<slug>.md -> /<lang>/blog/<slug>/
  permalink: (data) => {
    let lang = data.page.filePathStem.split("/")[3];
    if (!languageCodes.includes(lang)) {
      throw new Error(
        `${data.page.inputPath}: posts must live in a language folder (${languageCodes.join(", ")}).`,
      );
    }
    return `/${lang}/blog/${data.page.fileSlug}/`;
  },
};
