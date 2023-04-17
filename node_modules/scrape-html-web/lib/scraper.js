import axios from "axios";
import cheerio from "cheerio";

async function getScraping(options) {
  let result = [];

  const { url, mainSelector, childrenSelector, list } = options || {};

  await axios(
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  ).then((response) => {
    const html_data = response.data.contents;

    const $ = cheerio.load(html_data);

    const selectedElem = mainSelector;

    $(selectedElem)
      .children()
      .each((parentIndex, parentElem) => {
        let obj = {};

        $(childrenSelector).each((index, el) => {
          const { key, selector, attr, type, canBeEmpty, replace } = el;

          const value = $(parentElem).find(selector).length
            ? $(parentElem).find(selector)
            : $(parentElem);

          if (!attr && !type) {
            let text = value.text().trim();

            if (replace) {
              if (replace instanceof RegExp) {
                text = text.replace(replace, "");
              } else if (typeof replace === "function") {
                text = replace(text);
              }
            }

            obj = { ...obj, [key]: text };
          }

          if (attr && attr !== "") {
            if (value.attr(attr) || canBeEmpty) {
              obj = { ...obj, [key]: value.attr(attr) };
            }
          } else if (type === "text") {
            if (value.text().trim() || canBeEmpty) {
              let text = value.text().trim();

              if (replace) {
                if (replace instanceof RegExp) {
                  text = text.replace(replace, "");
                } else if (typeof replace === "function") {
                  text = replace(text);
                }
              }

              obj = { ...obj, [key]: text };
            }
          } else if (type === "html") {
            if (value.prop("outerHTML") || canBeEmpty) {
              let html = value.prop("outerHTML");

              if (replace) {
                if (replace instanceof RegExp) {
                  html = html.replace(replace, "");
                } else if (typeof replace === "function") {
                  html = replace(html);
                }
              }

              obj = { ...obj, [key]: html };
            }
          }
        });

        if (Object.keys(obj).length) {
          result.push(obj);
        }

        if (list === false) {
          return false;
        }
      });
  });

  try {
    return JSON.stringify(result, null, 2);
  } catch (err) {
    throw "There was an error converting to Json!";
  }
}

export async function scrapeHtmlWeb(options) {
  try {
    const data = await getScraping(options);

    return JSON.parse(data);
  } catch (err) {
    return { error: err };
  }
}

export default scrapeHtmlWeb;
