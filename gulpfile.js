'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');

require('./gulpfile-update-manifest');

build.initialize(gulp);
