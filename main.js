#!/usr/bin/env node

'use strict';

const minimist = require('minimist');

const tasks = require('./tasks/index.js');

const { task } = minimist(process.argv.slice(2));

tasks[task]();
