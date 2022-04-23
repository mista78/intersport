const {
    src,
    dest,
    series,
    parallel,
    watch
} = require('gulp');

const fs = require('fs');

const babel = require('gulp-babel');
const del = require('del');

const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const sass = require('gulp-sass')(require("node-sass"));
const cssnano = require("cssnano");
const postcss = require("gulp-postcss");
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const babelify = require('babelify');

const jsBuild = async () => {
    const bundler = browserify(`assets/src/js/index.js`);
    bundler.transform(babelify);
    return bundler.bundle()
        .on('error', function (err) {
            console.error(err);
        })
        .pipe(source('scripts.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename({
            extname: `.min.js`
        }))
        .pipe(dest('assets/dist/js/'));
}

const cssCompile = async () => {
    if (fs.existsSync(`assets/dist/css`)) {
        del(`assets/dist/css`);
    }
    return src('assets/src/sass/**/*.scss')
        .pipe(sass({ outputStyle: "expanded" }))
        .pipe(postcss([cssnano()]))
        .pipe(rename({
            extname: `.min.css`
        }))
        .pipe(dest('assets/dist/css/'));
}

function clean() {
    return del(`./assets/dist`);
}

function watcher() {
    watch(['assets/src/js/**/*.js'], jsBuild);
    watch(['assets/src/sass/**/*.scss'], cssCompile);
}

module.exports = {
    default: series(clean, parallel(cssCompile, jsBuild)),
    watch: series(clean, parallel(cssCompile, jsBuild), watcher),
}
