const mix = require("laravel-mix");

mix
  .copyDirectory("resources/js/locales", "public/locales")
  .ts("resources/js/app.ts", "public/js")
  .sourceMaps(true, "source-map")
  .react()
  .extract(["react"])
  .postCss("resources/css/app.css", "public/css", []);