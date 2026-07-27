const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cheerio = require("cheerio");
const { randomUUID } = require("crypto");

admin.initializeApp();

const BOWWWL_ORIGIN = "https://www.bowwwl.com";
const DETAIL_PATH_PREFIX = "/bowling-ball-database/";
const USER_AGENT = "pin-tracker-personal-app (+https://pin-tracker-2de10.web.app)";

const absoluteBowwwlUrl = (path) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BOWWWL_ORIGIN}${path}`;
};

const requireAuth = (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
};

// bowwwl's own search-balls autocomplete box calls this same JSON endpoint —
// no HTML scraping needed for search, only for the detail page below.
exports.searchBowwwlBalls = onCall(async (request) => {
  requireAuth(request);
  const query = (request.data?.query ?? "").trim();
  if (query.length < 2) {
    return { results: [] };
  }

  const endpoint = `${BOWWWL_ORIGIN}/callback/balls?q=${encodeURIComponent(query)}&combine=${encodeURIComponent(query)}`;
  let items;
  try {
    const response = await fetch(endpoint, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) {
      throw new Error(`bowwwl search returned ${response.status}`);
    }
    items = await response.json();
  } catch (error) {
    logger.error("searchBowwwlBalls fetch failed", error);
    throw new HttpsError("unavailable", "Couldn't reach the ball database — try again.");
  }

  // The autocomplete title is bowwwl's top-level "value" field (or, equivalently,
  // item.fields.title) — not item.title, which doesn't exist at the top level.
  let lastBrand = null;
  const results = (Array.isArray(items) ? items : [])
    .filter((item) => item?.link && item?.value)
    .slice(0, 10)
    .map((item) => {
      if (item.group?.group_name) lastBrand = item.group.group_name;
      const imageSrcMatch = /src="([^"]+)"/.exec(item.fields?.field_ball_image ?? "");
      return {
        title: item.value,
        brand: lastBrand,
        url: absoluteBowwwlUrl(item.link),
        thumbnailUrl: imageSrcMatch ? absoluteBowwwlUrl(imageSrcMatch[1]) : null,
      };
    });

  return { results };
});

const text = ($el) => $el.first().text().trim() || null;

// Generic label -> value sweep so any per-weight spec (RG, Diff, MB Diff —
// whatever bowwwl shows for a given core) comes through without hardcoding
// which fields exist, since asymmetric cores show one more than symmetric.
const parseWeightSpecs = ($, $core) => {
  const specs = [];
  $core.find(".paragraph--type--core-specs").each((_, el) => {
    const $block = $(el);
    const weightLabel = text($block.find("h6.card-title"));
    const weightMatch = /(\d+(?:\.\d+)?)/.exec(weightLabel ?? "");
    if (!weightMatch) return;

    const values = {};
    $block.find(".field__item").each((__, fieldEl) => {
      const $field = $(fieldEl).closest(".field");
      const label = text($field.find(".field__label"));
      const value = text($(fieldEl));
      if (label && value) values[label] = value;
    });

    specs.push({ weight: Number(weightMatch[1]), values });
  });
  return specs;
};

const parseBallDetailHtml = (html) => {
  const $ = cheerio.load(html);

  const name = text($("h1.title"));
  const brand = text($(".breadcrumb-item a").eq(2));
  const imageSrc = $(".ball-image img").first().attr("src");
  const releaseDate = text($(".field--name-field-release-date .field__item"));
  const factoryFinish = text($(".field--name-field-factory-finish .field__item"));

  const $coverstock = $(".field--name-field-coverstock");
  const coverstockName = text($coverstock.find("h5.card-title a"));
  const coverstockType = text($coverstock.find(".field--name-field-coverstock-type .field__item"));

  const $core = $(".field--name-field-core");
  const coreName = text($core.find("h5.card-header a"));
  const coreType = text($core.find(".field--name-field-core-type .field__item"));
  const specsByWeight = parseWeightSpecs($, $core);

  if (!name) {
    throw new HttpsError("not-found", "Couldn't find ball details on that page.");
  }

  return {
    name,
    brand,
    imageUrl: absoluteBowwwlUrl(imageSrc),
    releaseDate,
    factoryFinish,
    coverstockName,
    coverstockType,
    coreName,
    coreType,
    specsByWeight,
  };
};

exports.fetchBowwwlBallDetails = onCall(async (request) => {
  requireAuth(request);
  const url = request.data?.url ?? "";
  if (!url.startsWith(`${BOWWWL_ORIGIN}${DETAIL_PATH_PREFIX}`)) {
    throw new HttpsError("invalid-argument", "Not a bowwwl ball detail URL.");
  }

  let html;
  try {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) {
      throw new Error(`bowwwl detail page returned ${response.status}`);
    }
    html = await response.text();
  } catch (error) {
    logger.error("fetchBowwwlBallDetails fetch failed", error);
    throw new HttpsError("unavailable", "Couldn't reach the ball database — try again.");
  }

  const details = parseBallDetailHtml(html);
  details.bowwwlUrl = url;

  if (details.imageUrl) {
    try {
      const imageResponse = await fetch(details.imageUrl, { headers: { "User-Agent": USER_AGENT } });
      if (imageResponse.ok) {
        const contentType = imageResponse.headers.get("content-type") ?? "image/png";
        const extension = contentType.includes("webp") ? "webp" : contentType.includes("jpeg") ? "jpg" : "png";
        const buffer = Buffer.from(await imageResponse.arrayBuffer());
        const path = `ball-images/${request.auth.uid}/${randomUUID()}.${extension}`;
        const file = admin.storage().bucket().file(path);
        const downloadToken = randomUUID();
        await file.save(buffer, {
          contentType,
          metadata: { metadata: { firebaseStorageDownloadTokens: downloadToken } },
        });
        const bucketName = admin.storage().bucket().name;
        details.imagePath = path;
        details.imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`;
      } else {
        logger.warn(`bowwwl image fetch returned ${imageResponse.status}, leaving ball without an image`);
        details.imageUrl = null;
      }
    } catch (error) {
      logger.warn("mirroring bowwwl image failed, leaving ball without an image", error);
      details.imageUrl = null;
    }
  }

  return details;
});
