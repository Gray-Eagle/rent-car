'use strict';

var fs = require('fs');

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var notify = require("gulp-notify");
var concat = require('gulp-concat');

var sass = require('gulp-sass');
var minifyCss = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var uglify = require('gulp-uglify');

var spritesmith = require('gulp.spritesmith');
var imagemin = require('gulp-imagemin');

var browserSync = require('browser-sync').create();
var streamify = require('gulp-streamify');

var vendor = {
    css: [
        './bower_components/bootstrap/dist/css/bootstrap.css'
        //'./vendor/bower/fancybox/dist/jquery.fancybox.css',
        //'./vendor/bower/nouislider/distribute/nouislider.css'
    ],
    fonts: [
        './bower_components/bootstrap/dist/fonts/**/*'
    ],
    js: [
        './bower_components/jquery/dist/jquery.js',
        './bower_components/bootstrap/dist/js/bootstrap.js'
        //'./vendor/bower/fancybox/dist/jquery.fancybox.js',
        //'./vendor/bower/iosslider/_src/jquery.iosslider.js',
        //'./vendor/bower/jquery.inputmask/dist/jquery.inputmask.bundle.js',
        //'./vendor/bower/nouislider/distribute/nouislider.js'
    ]
};

var errorHandler = {
    errorHandler: notify.onError({
        //icon: './public_html/img/mini-logo.png',
        title: 'Ошибка в плагине <%= error.plugin %>',
        message: "Ошибка: <%= error.message %>"
    })
};

var sprite = function(type) {
    return function(){
        var spriteData = gulp.src('./assets/icons/' + type + '/*.png')
            .pipe(plumber(errorHandler))
            .pipe(spritesmith({
                imgName: '../img/icons/sprite-' + type + '.png',
                cssName: '_sprite-' + type + '.scss',
                padding: 5,
                cssVarMap: function(sprite) {
                    sprite.name = 'icon-' + type + '-' + sprite.name
                }
            }));

        spriteData.img
            .pipe(streamify(imagemin()))
            .pipe(gulp.dest('./public_html/img/'));
        spriteData.css.pipe(gulp.dest('./assets/sass/icons/'));
        return spriteData;
    };
};

gulp.task('sprite:main', sprite('main'));
gulp.task('sprite:advantages', sprite('advantages'));

gulp.task('sprite', [
    'sprite:main',
    'sprite:advantages'
]);

gulp.task('css:app', function(){
    gulp.src('./assets/css/**/*.css')
        .pipe(plumber(errorHandler))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(concat('style.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./css'));

    gulp.src('./assets/css/**/*.css')
        .pipe(plumber(errorHandler))
        .pipe(autoprefixer())
        .pipe(concat('style.min.css'))
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('./css'));

    fs.writeFile("./assets/css.app.version.json", JSON.stringify({
        'v': new Date().getTime()
    }));
});

gulp.task('css:vendor', function(){
    gulp.src(vendor.css)
        .pipe(plumber(errorHandler))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(concat('vendor.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./css'));

    gulp.src(vendor.css)
        .pipe(plumber(errorHandler))
        .pipe(autoprefixer())
        .pipe(concat('vendor.min.css'))
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('./css'));

    fs.writeFile("./assets/css.vendor.version.json", JSON.stringify({
        'v': new Date().getTime()
    }));
});

gulp.task('js:app', function() {
    gulp.src('./assets/js/**/*.js')
        .pipe(plumber(errorHandler))
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./js'));

    gulp.src('./assets/js/**/*.js')
        .pipe(plumber(errorHandler))
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./js'));

    fs.writeFile("./assets/js.app.version.json", JSON.stringify({
        'v': new Date().getTime()
    }));
});

gulp.task('js:vendor', function() {
    gulp.src(vendor.js)
        .pipe(plumber(errorHandler))
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./js'));

    gulp.src(vendor.js)
        .pipe(plumber(errorHandler))
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./js'));

    fs.writeFile("./assets/js.vendor.version.json", JSON.stringify({
        'v': new Date().getTime()
    }));
});

gulp.task('image', function() {
    gulp.src(['./img/**/*.jpg', './img/**/*.png'])
        .pipe(streamify(imagemin()))
        .pipe(gulp.dest('./img'));
});

gulp.task('fonts', function(){
    gulp.src('./assets/fonts/**/*')
        .pipe(gulp.dest('./fonts'));

    gulp.src(vendor.fonts)
        .pipe(gulp.dest('./fonts'));
});

gulp.task('compiler', [
    //'sprite',
    'css:app',
    'css:vendor',
    'js:app',
    'js:vendor',
    'fonts'
]);

gulp.task('watch', ['compiler'], function(){
    browserSync.init({
        host: 'http://localhost:51367',
        online: false,
        scriptPath: function (path, port, options) {
            return options.getIn(['urls', 'local']) + "/browser-sync/browser-sync-client.js";
        },
        files: [
            './css/style.css',
            './js/app.js',
            './*.html'
        ]
    });

    gulp.watch('./assets/css/**/*.css', ['css:app']);
    gulp.watch('./assets/js/**/*.js', ['js:app']);
});