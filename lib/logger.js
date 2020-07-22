'use strict';

const ora = require('ora');

let instance = null;

/** Class representing a logger. */
class Logger {
  /**
   * Create a Logger instance.
   * There can only be one Logger instance within the environment
   */
  constructor() {
    if (!instance) {
      instance = this;
    }

    this.ora = ora();

    return instance;
  }

  /**
   * Start the spinner with the message.
   * @param {String} msg
   */
  start(msg) {
    this.spinningMsg = msg;
    this.ora.start(msg);
  }

  /**
   * Log an informational message.
   * @param {String} msg
   */
  info(msg) {
    const {isSpinning} = this.ora;

    if (isSpinning) {
      this.ora.stop();
    }

    this.ora.info(msg);

    if (isSpinning) {
      this.ora.start(this.spinningMsg);
    }
  }

  /**
   * Log a verbose, debug message.
   * Note that the environmental variabe `DEBUG` must be set.
   * @param {String} msg
   */
  debug(msg) {
    if (!process.env.DEBUG) {
      return;
    }

    const {isSpinning} = this.ora;

    if (isSpinning) {
      this.ora.stop();
    }

    console.debug(`  ${msg}`);

    if (isSpinning) {
      this.ora.start(this.spinningMsg);
    }
  }

  /**
   * Stop the spinner with a success message.
   * @param {String} msg
   */
  success(msg) {
    this.spinningMsg = '';
    this.ora.succeed(msg);
  }

  /**
   * Stop the spinner with an error message.
   * @param {String} msg
   */
  error(msg) {
    this.spinningMsg = '';
    this.ora.fail(msg);
  }
}

module.exports = new Logger();
