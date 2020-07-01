'use strict';

const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const utils = require('./utils');

function compress(folder) {
    return new Promise((resolve, reject) => {
        const src = path.join(process.cwd(), 'site_data', folder);
        const target = path.join(process.cwd(), 'site_data', 'temp', `${folder}.zip`);
        const writeStream = fs.createWriteStream(target);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('warning', (err) => reject(err));
        archive.on('error', (err) => reject(err));
        writeStream.on('close', () => resolve(target));

        archive.pipe(writeStream);
        archive.directory(src, folder);
        archive.finalize();
    });
}

function dataCompress(folders) {
    utils.createTempDirectory();
    return Promise.all(folders.map((folder) => compress(folder)));
}

module.exports = dataCompress;
