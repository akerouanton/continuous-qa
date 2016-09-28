const MongoClient = require('mongodb').MongoClient;
const config = require('config');
const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

import LogRepository from '../lib/service/LogRepository';

describe('LogRepository integrates with mongodb', function () {
  let repository, collection;

  before(function (done) {
    MongoClient
      .connect(`${config.mongo.uri}/${config.mongo.dbName}`)
      .then((db) => {
        collection = db.collection('logs');
        done();
      })
      .catch((err) => {
        done(err);
      })
    ;
  });
  beforeEach(function () {
    repository = new LogRepository(collection);
  });

  it('retrieves logs for the specified analysis', function () {
    return repository.getLogs('urn:gh:knplabs/gaufrette:1:php-cs-fixer').should.eventually.deep.equal([
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "echo \"Cloning ${REPO_URL} into $(pwd)\"\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "pwd\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "Cloning https://github.com/knplabs/gaufrette into /src\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "git clone --branch ${GIT_REF} ${REPO_URL} .\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "Cloning into '.'...\n"
      },
      {
        "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
        "log": "~/.composer/vendor/bin/php-cs-fixer --diff --dry-run -v --format=xml fix src/ >/artifacts/php-cs-fixer.xml\n"
      }
    ]);
  });
});
