#!/usr/bin/env node

'use strict';

const minimist = require('minimist');
const tasks = require('./tasks/index');

const {task, debug} = minimist(process.argv.slice(2));

if (debug) {
  process.env.DEBUG = true;
}

tasks[task]();
