'use strict';

const ora = require('ora');

let instance = null;

class Logger {
    constructor() {
        if (!instance) {
            instance = this;
        }

        this.ora = ora();

        return instance;
    }

    start(msg) {
        this.spinningMsg = msg;
        this.ora.start(msg);
    }

    info(msg) {
        const { isSpinning } = this.ora;

        if (isSpinning) {
            this.ora.stop();
        }

        this.ora.info(msg);

        if (isSpinning) {
            this.ora.start(this.spinningMsg);
        }
    }

    debug(msg) {
        if (!process.env.DEBUG) {
            return;
        }

        const { isSpinning } = this.ora;

        if (isSpinning) {
            this.ora.stop();
        }

        console.debug(`  ${msg}`);

        if (isSpinning) {
            this.ora.start(this.spinningMsg);
        }
    }

    success(msg) {
        this.spinningMsg = '';
        this.ora.succeed(msg);
    }

    error(msg) {
        this.spinningMsg = '';
        this.ora.fail(msg);
    }
}

module.exports = new Logger();
