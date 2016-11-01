db.createCollection('pipelines');

var stage = {
  position: 0,
  tasks: [
    {name: 'php-cs-fixer', runner: 'php-cs-fixer'},
    {name: 'phpqa', runner: 'phpqa'}
  ]
};

db.pipelines.insert([
  {
    projectUrn: 'urn:gh:knplabs/gaufrette',
    pattern: 'feature/*',
    stages: [stage]
  },
  {
    projectUrn: 'urn:gh:knplabs/gaufrette',
    pattern: 'master',
    stages: [stage]
  },
  {
    projectUrn: 'urn:gh:knplabs/gaufrette',
    pattern: 'mas*',
    stages: [stage]
  }
]);
