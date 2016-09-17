Feature: Retrieve a specific build
  In order to know the status of a build, and its analyses
  As an API consumer
  I want to retrieve a specific build

  @reset-db
  Scenario: Retrieve an existing build
    Given I prepare a GET request on "/build/urn:gh:knplabs/gaufrette:1"
     When I send the request
     Then I should receive a 200 json response
      And the response should contains the following json:
        """
          {
              "state": "finished",
              "urn": "urn:gh:knplabs\/gaufrette:1",
              "projectUrn": "urn:gh:knplabs\/gaufrette",
              "repoUrl": "https:\/\/github.com\/knplabs\/gaufrette",
              "analyzers": ["php-cs-fixer", "phpqa"],
              "analyses": [
                  {
                      "analyzer": "php-cs-fixer",
                      "state": "failed"
                  },
                  {
                      "analyzer": "php-cs-fixer",
                      "state": "successful"
                  }
              ]
          }
        """

  Scenario: Retrieve an nonexistent build
    Given I prepare a GET request on "/build/urn:gh:knplabs/gaufrette:100"
     When I send the request
     Then I should receive a 404 json response
      And the response should contains the following json:
        """
        {"error": "BuildNotFound"}
        """
