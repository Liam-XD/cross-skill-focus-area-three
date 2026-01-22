Feature: Example API testing

  @skip
  Scenario: Get a post by ID
    When I send a GET request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the response status should be 200
    And the response should have a property "id" with value 1

  @skip
  Scenario: Create a new post
    When I send a POST request to "https://jsonplaceholder.typicode.com/posts" with body:
      | title  | foo |
      | body   | bar |
      | userId |   1 |
    Then the response status should be 201
    And the response should have a property "title" with value "foo"
