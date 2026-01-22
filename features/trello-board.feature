Feature: Trello Board API Endpoint

  Scenario: Create a new board via API
    Given I am authenticated with the Trello API
    When I send a request to create a board
    Then the API should return a success status
    And the response should contain a valid board ID
