#!/usr/bin/env node

'use strict';

const minimist = require('minimist');

const tasks = require('./tasks/index');

const { task } = minimist(process.argv.slice(2));

tasks[task]();
