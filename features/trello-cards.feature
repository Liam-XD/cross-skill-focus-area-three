Feature: Trello Cards API Endpoint

  @card @card-create @smoke
  Scenario: Create a new card via API
    Given I am authenticated with the Trello API
    When I send a request to create a card
    Then the API should return a success status
    And the response should contain a valid card ID

  @card
  Scenario: Retrieve a card by cardID
    Given I have a valid card ID
    When I send a request to retrieve the card details
    Then the API should return a success status
    And the response should contain the correct card information

  @card
  Scenario: Update a card name via API
    Given I have a valid card ID
    When I send a request to update the card's name
    Then the API should return a success status
    And the response should reflect the updated card name

  @card
  Scenario: Delete a card via API
    Given I have a valid card ID
    When I send a request to delete the card
    Then the API should return a success status
    And the card should no longer exist when I attempt to retrieve it
