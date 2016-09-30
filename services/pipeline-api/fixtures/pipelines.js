db.createCollection('pipelines');

db.pipelines.insert([
  {
    projectUrn: 'urn:gh:knplabs/gaufrette',
    pattern: 'feature/*',
    stages: [
      {runners: ['php-cs-fixer', 'phpqa']}
    ]
  },
  {
    projectUrn: 'urn:gh:knplabs/gaufrette',
    pattern: 'master',
    stages: [
      {runners: ['php-cs-fixer', 'phpqa']}
    ]
  },
  {
    projectUrn: 'urn:gh:knplabs/gaufrette',
    pattern: 'mas*',
    stages: [
      {runners: ['php-cs-fixer', 'phpqa']}
    ]
  }
]);
