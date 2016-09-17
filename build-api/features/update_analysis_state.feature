Feature: Change the state of a build analysis

  Scenario:
    Given I prepare a PATCH request on "/build/urn:gh:knplabs/gaufrette:2/php-cs-fixer"
      And I specified the following request body:
      | state | succeeded |
     When I send the request
     Then I should receive a 200 json response
    And the response should contains the following json:
        """
          {
              "state": "finished",
              "urn": "urn:gh:knplabs\/gaufrette:2",
              "projectUrn": "urn:gh:knplabs\/gaufrette",
              "repoUrl": "https:\/\/github.com\/knplabs\/gaufrette",
              "analyzers": ["php-cs-fixer", "phpqa"],
              "analyses": [
                  {
                      "analyzer": "php-cs-fixer",
                      "state": "succeeded"
                  },
                  {
                      "analyzer": "php-cs-fixer",
                      "state": "successful"
                  }
              ]
          }
        """

  Scenario:
    Given I prepare a PATCH request on "/build/urn:gh:knplabs/gaufrette:100/php-cs-fixer"
      And I specified the following request body:
      | state | invalid |
     When I send the request
     Then I should receive a 400 json response
      And the response should contains the following json:
      """
      {"error": "InvalidState"}
      """

  Scenario:
    Given I prepare a PATCH request on "/build/urn:gh:knplabs/gaufrette:100/php-cs-fixer"
      And I specified the following request body:
      | state | succeeded |
     When I send the request
     Then I should receive a 404 json response
      And the response should contains the following json:
      """
      {"error": "BuildNotFound"}
      """

  Scenario:
    Given I prepare a PATCH request on "/build/urn:gh:knplabs/gaufrette:2/unknown"
      And I specified the following request body:
      | state | succeeded |
     When I send the request
     Then I should receive a 404 json response
      And the response should contains the following json:
      """
      {"error": "AnalysisNotFound"}
      """
