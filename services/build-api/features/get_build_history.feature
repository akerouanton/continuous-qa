Feature: Retrieve build history
  In order to get every builds for a specific project
  As an API consumer
  I want to retrieve the list of builds for a project

  @reset-db
  Scenario:
    Given I prepare a GET request on "/builds/urn:gh:knplabs/gaufrette"
     When I send the request
     Then I should receive a 200 json response
      And the response should contains the following json:
        """
          [
            {
                "state": "finished",
                "urn": "urn:gh:knplabs\/gaufrette:1",
                "projectUrn": "urn:gh:knplabs\/gaufrette",
                "repoUrl": "https:\/\/github.com\/knplabs\/gaufrette",
                "reference": "master",
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
            },
            {
                "state": "started",
                "urn": "urn:gh:knplabs\/gaufrette:2",
                "projectUrn": "urn:gh:knplabs\/gaufrette",
                "repoUrl": "https:\/\/github.com\/knplabs\/gaufrette",
                "reference": "develop",
                "analyzers": ["php-cs-fixer", "phpqa"],
                "analyses": [
                    {
                        "analyzer": "php-cs-fixer",
                        "state": "running"
                    },
                    {
                        "analyzer": "php-cs-fixer",
                        "state": "successful"
                    }
                ]
            }
          ]
        """
