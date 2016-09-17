Feature: Create a new build
  In order to get up-to-date quality reports of my project
  As a project member
  I want to start new builds

  Background:
    Given I prepare a POST request on "/builds/urn:gh:knplabs/gaufrette/new"
      And I specified the following request headers:
      | Content-Type | application/json |

  @reset-db
  Scenario: Create a new build
    Given I specified the following request body:
      | repoUrl | https://github.com/knplabs/gaufrette |
     When I send the request
     Then I should receive a 200 json response
      And the response should contains the following json:
      """
      {
          "state": "started",
          "urn": "urn:gh:knplabs\/gaufrette:3",
          "projectUrn": "urn:gh:knplabs\/gaufrette",
          "repoUrl": "https:\/\/github.com\/knplabs\/gaufrette",
          "analyzers": [
              "phpqa",
              "php-cs-fixer"
          ],
          "analyses": [
              {
                  "analyzer": "phpqa",
                  "state": "created"
              },
              {
                  "analyzer": "php-cs-fixer",
                  "state": "created"
              }
          ]
      }
      """

  Scenario: Submit with missing repository URL
     When I send the request
     Then I should receive a 400 json response
      And the response should contains the following json:
        """
        {"error": "MissingRepoUrl"}
        """
