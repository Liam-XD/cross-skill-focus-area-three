Feature: Trello Board API Endpoint

  @board @smoke
  Scenario: Create a new board via API
    Given I am authenticated with the Trello API
    When I send a request to create a board
    Then the API should return a success status
    And the response should contain a valid board ID

  @board
  Scenario: Retrieve a board by boardID
    Given I have a valid board ID
    When I send a request to retrieve the board details
    Then the API should return a success status
    And the response should contain the correct board information

  @board
  Scenario: Update a board's name via API
    Given I have a valid board ID
    When I send a request to update the board's name
    Then the API should return a success status
    And the response should reflect the updated board name

  @board
  Scenario: Delete a board via API
    Given I have a valid board ID
    When I send a request to delete the board
    Then the API should return a success status
    And the board should no longer exist when I attempt to retrieve it

  @board @negative
  Scenario: Update a deleted board via API
    Given I have a valid board ID
    And I send a request to delete the board
    When I send a request to update the deleted board's name
    Then the API should return a 404 status
    And the response should contain a message "Board not found"

  @board @smoke @negative
  Scenario: Create a board with invalid API key
    Given I am using an invalid Trello API key
    When I send an unauthorized request to create a board
    Then the API should return an unauthenticated or forbidden status
    And the response should contain a message "invalid key"
