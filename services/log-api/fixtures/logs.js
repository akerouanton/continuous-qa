db.createCollection('logs');

db.logs.insert([
  {
    "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
    "log": "\n",
    "@timestamp": new Date()
  },
  {
    "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
    "log": "echo \"Cloning ${REPO_URL} into $(pwd)\"\n",
    "@timestamp": new Date()
  },
  {
    "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
    "log": "pwd\n",
    "@timestamp": new Date()
  },
  {
    "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
    "log": "Cloning https://github.com/knplabs/gaufrette into /src\n",
    "@timestamp": new Date()
  },
  {
    "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
    "log": "git clone --branch ${GIT_REF} ${REPO_URL} .\n",
    "@timestamp": new Date()
  },
  {
    "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
    "log": "Cloning into '.'...\n",
    "@timestamp": new Date()
  },
  {
    "analysisUrn": "urn:gh:knplabs/gaufrette:1:php-cs-fixer",
    "log": "~/.composer/vendor/bin/php-cs-fixer --diff --dry-run -v --format=xml fix src/ >/artifacts/php-cs-fixer.xml\n",
    "@timestamp": new Date()
  }
]);
