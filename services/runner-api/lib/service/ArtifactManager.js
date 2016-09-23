const Promise = require('promise');
const fs = require('fs');
const mkdir = Promise.denodeify(fs.mkdir);
const chown = Promise.denodeify(fs.chown);
const readdir = Promise.denodeify(fs.readdir);
const rmdir = Promise.denodeify(fs.rmdir);
const lstat = Promise.denodeify(fs.lstat);
const unlink = Promise.denodeify(fs.unlink);

import logger from '../Logger';

export default class ArtifactManager {
  constructor(tmpDir) {
    this._tmpDir = tmpDir;
  }

  getDirectory(name) {
    return `${this._tmpDir}/${name}`;
  }

  createDirectory(name) {
    const artifactDirectory = this.getDirectory(name);

    return mkdir(artifactDirectory)
      .then(() => {
        return chown(artifactDirectory, 1000, 1000);
      })
      .then(() => {
        return artifactDirectory;
      })
    ;
  }

  removeDirectory(name) {
    const path = this.getDirectory(name);

    return ArtifactManager._rmdir(path);
  }

  static _rmdir(path) {
    logger.debug(`Removing directory ${path}.`);

    return readdir(path)
      .then((files) => {
        const promises = [];

        files.forEach((file) => {
          const filePath = `${path}/${file}`;

          promises.push(lstat(filePath).then((stat) => {
            if (stat.isDirectory()) {
              return ArtifactManager._rmdir(filePath);
            } else {
              return unlink(filePath);
            }
          }));
        });

        return Promise.all(promises).then(() => {
          return rmdir(path);
        });
      })
    ;
  }
}
