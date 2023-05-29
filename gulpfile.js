const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const avif = require("gulp-avif");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const svgSprite = require("gulp-svg-sprite");
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");
const include = require("gulp-include");

const styles = () => {
  return src("app/scss/style.scss")
    .pipe(autoprefixer({ overrideBrowserslist: ["last 10 version"] }))
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src("app/js/main.js")
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
};

const images = () => {
  return src(["app/img/*.png", "app/img/*.jpg"])
    .pipe(newer("app/img/src"))
    .pipe(avif({ quality: 50 }))

    .pipe(src(["app/img/*.*"]))
    .pipe(newer("app/img/src"))
    .pipe(webp())

    .pipe(src(["app/img/*.*"]))
    .pipe(newer("app/img/src"))
    .pipe(imagemin())

    .pipe(dest("app/img/src"));
};

const sprite = () => {
  return src("app/img/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
            example: true,
          },
        },
      })
    )
    .pipe(dest("app/img/src"));
};

const fonts = () => {
  return src("app/fonts/*.*")
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      })
    )
    .pipe(ttf2woff2())
    .pipe(dest("app/fonts/src"));
};

const pages = () => {
  return src("app/pages/*.html")
    .pipe(
      include({
        includePaths: "app/components",
      })
    )
    .pipe(dest("app"))
    .pipe(browserSync.stream());
};
const watching = () => {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
  watch(["app/scss/style.scss"], styles);
  watch(["app/img"], images);
  watch(["app/js/main.js"], scripts);
  watch(["app/components/*", "app/pages/*"], pages);
  watch(["app/*.html"]).on("change", browserSync.reload);
};

const cleanDist = () => {
  return src("build").pipe(clean());
};

const building = () => {
  return src(
    [
      "app/css/style.min.css",
      "app/img/src/*.*",
      "!app/img/src/*.svg",
      "app/img/src/sprite.svg",
      "app/fonts/src/*.*",
      "app/js/main.min.js",
      "app/*.html",
    ],
    {
      allowEmpty: true,
      base: "app",
    }
  ).pipe(dest("build"));
};

exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.sprite = sprite;
exports.fonts = fonts;
exports.pages = pages;
exports.watching = watching;

exports.default = parallel(
  images,
  fonts,
  sprite,
  styles,
  scripts,
  pages,
  watching
);
exports.build = series(cleanDist, building);
