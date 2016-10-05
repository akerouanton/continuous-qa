db.createCollection('projects');
db.createCollection('builds');

db.projects.insertOne({"projectUrn": "urn:gh:knplabs/gaufrette", "builds": 2});
db.builds.insert([
  {
    "_id" : ObjectId("57efb186fcd8b6038c6f2d04"),
    "buildId" : "1",
    "projectUrn" : "urn:gh:knplabs/gaufrette",
    "branch" : "master",
    "repoUrl" : "https://github.com/knplabs/gaufrette",
    "state" : "running",
    "stages" : [
      {
        "state": "running",
        "position": 1,
        "runners": [
          {"name": "php-cs-fixer", "state": "running"},
          {"name": "phpqa", "state": "succeeded"}
        ]
      }
    ],
    "__v" : 0
  },
  {
    "_id" : ObjectId("57efb186fcd8b6038c6f2d05"),
    "buildId" : "2",
    "projectUrn" : "urn:gh:knplabs/gaufrette",
    "branch" : "master",
    "repoUrl" : "https://github.com/knplabs/gaufrette",
    "stages" : [ ],
    "state" : "created",
    "__v" : 0
  },
  {
    "_id" : ObjectId("57efb186fcd8b6038c6f2d06"),
    "buildId" : "3",
    "projectUrn" : "urn:gh:knplabs/gaufrette",
    "branch" : "master",
    "repoUrl" : "https://github.com/knplabs/gaufrette",
    "state" : "running",
    "stages" : [
      {
        "state": "running",
        "position": 1,
        "runners": [
          {"name": "build", "state": "running"}
        ]
      },
      {
        "state": "pending",
        "position": 2,
        "runners": [
          {"name": "php-cs-fixer", "state": "pending"},
          {"name": "phpqa", "state": "pending"},
          {"name": "phpspec", "state": "pending"},
          {"name": "behat", "state": "pending"}
        ]
      },
      {
        "state": "pending",
        "position": 2,
        "runners": [
          {"name": "deploy", "state": "pending"}
        ]
      }
    ],
    "__v" : 0
  },
  {
    "_id" : ObjectId("57efb186fcd8b6038c6f2d07"),
    "buildId" : "4",
    "projectUrn" : "urn:gh:knplabs/gaufrette",
    "branch" : "master",
    "repoUrl" : "https://github.com/knplabs/gaufrette",
    "state" : "running",
    "stages" : [
      {
        "state": "running",
        "position": 1,
        "runners": [
          {"name": "deploy", "state": "pending"}
        ]
      }
    ],
    "__v" : 0
  }
]);
