db.createCollection('plugins');

db.plugins.insert([
  {
    name: 'docker',
    type: 'runner-platform',
    enabled: true,
    endpoints: [
      {name: 'StartRunner', url: 'http://continuousqa_docker_1:8000/runner'},
      {name: 'DropRunner', url: 'http://continuousqa_docker_1:8000/runner'}
    ],
    hooks: []
  },
  {
    name: 'php-cs-fixer',
    type: 'runner',
    platform: 'docker',
    enabled: true,
    endpoints: [],
    hooks: []
  },
  {
    name: 'phpqa',
    type: 'runner',
    platform: 'docker',
    enabled: true,
    endpoints: [],
    hooks: []
  }
]);
