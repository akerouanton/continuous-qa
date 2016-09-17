db.createCollection('projects');
db.createCollection('builds');

db.projects.insertOne({"urn": "urn:gh:knplabs/gaufrette", "builds": 2});
db.builds.insertOne({
  "_id": new ObjectId("57d8a958a3ddcc0007335b00"),
  "__pclass" : new BinData(128,"QXBwXE1vZGVsXEJ1aWxk"),
  "state": "finished",
  "urn": "urn:gh:knplabs/gaufrette:1",
  "projectUrn": "urn:gh:knplabs/gaufrette",
  "repoUrl": "https://github.com/knplabs/gaufrette",
  "analyzers": ["php-cs-fixer", "phpqa"],
  "analyses": [
    {
      "analyzer": "php-cs-fixer",
      "state": "failed",
      "_id": new ObjectId("57d8a973a3ddcc00062043f6"),
      "__pclass": new BinData(128,"QXBwXE1vZGVsXEFuYWx5c2lz")
    },
    {
      "analyzer": "php-cs-fixer",
      "state": "successful",
      "_id": new ObjectId("57d8aa24a3ddcc00062043f9"),
      "__pclass": new BinData(128,"QXBwXE1vZGVsXEFuYWx5c2lz")
    }
  ]
});
db.builds.insertOne({
  "_id": new ObjectId("57d8aac3a3ddcc0007335b03"),
  "__pclass" : new BinData(128,"QXBwXE1vZGVsXEJ1aWxk"),
  "state": "started",
  "urn": "urn:gh:knplabs/gaufrette:2",
  "projectUrn": "urn:gh:knplabs/gaufrette",
  "repoUrl": "https://github.com/knplabs/gaufrette",
  "analyzers": ["php-cs-fixer", "phpqa"],
  "analyses": [
    {
      "analyzer": "php-cs-fixer",
      "state": "running",
      "_id": new ObjectId("57d8ab78a3ddcc0007335b06"),
      "__pclass": new BinData(128,"QXBwXE1vZGVsXEFuYWx5c2lz")
    },
    {
      "analyzer": "php-cs-fixer",
      "state": "successful",
      "_id": new ObjectId("57d8ab38a3ddcc00062043fc"),
      "__pclass": new BinData(128,"QXBwXE1vZGVsXEFuYWx5c2lz")
    }
  ]
});
