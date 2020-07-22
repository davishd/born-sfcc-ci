'use strict';

const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const utils = require('./utils');

function getSrcFolderPath(folder) {
    const folderPath = folder.split(path.sep);
    const siteDataFolderPath = path.join(process.cwd(), 'site_data', ...folderPath);

    if (fs.existsSync(siteDataFolderPath)) {
        return siteDataFolderPath;
    }

    const siteDataCartridgesFolderPath = path.join(process.cwd(), 'site_data', 'cartridges', ...folderPath);
    return siteDataCartridgesFolderPath;
}

function compress(folder) {
    return new Promise((resolve, reject) => {
        const src = getSrcFolderPath(folder);
        const folderName = folder.replace(/\//g, '_');
        const temp = path.join(process.cwd(), 'site_data', 'temp');
        const target = path.join(temp, `${folderName}.zip`);

        if (!fs.existsSync(src)) {
            reject(new Error(`Data folder ${src} does not exist.`));
        }
        if (!fs.existsSync(temp)) {
            reject(new Error(`Temporary folder ${temp} does not exist.`));
        }
        const writeStream = fs.createWriteStream(target);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('warning', (err) => reject(err));
        archive.on('error', (err) => reject(err));
        writeStream.on('close', () => resolve(target));

        archive.pipe(writeStream);
        archive.directory(src, folderName);
        archive.finalize();
    });
}

function dataCompress(folders) {
    if (!folders || folders.length === 0) {
        throw new Error('No folders to compress were provided. Verify your dw.json and config.json configurations.');
    }

    utils.createTempDirectory();

    return Promise.all(folders.map((folder) => compress(folder)));
}

module.exports = dataCompress;
