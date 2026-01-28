
// Centralized assertion helpers for Cucumber step definitions

/**
* This function can work with any value type (string, number, object, etc).
* It takes two things, a value that might be undefined, and a message to use in the error if it is.
* If the value is defined, it returns it with the correct type.
* If the value is undefined, it throws an error with the provided message.
*/
export function assertDefined<ValueType>(value: ValueType | undefined, message: string): ValueType {
    if (value === undefined) {
        throw new Error(message);
    }
    return value;
}

const REQUIRED_ENV_VARS = [
    'TRELLO_API_KEY',
    'TRELLO_API_TOKEN',
    'TRELLO_API_BASE_URL'
];

// Function to validate required environment variables are set
export function validateEnvVars() {
    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]); // Check for missing env varariable values in .env file
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}` // List missing env variables separated by a comma
        );
    }
}

// Centralized error messages
export const ERRORS = {
    RESPONSE_UNAVAILABLE: 'Response is not available. Ensure a request step has run before this assertion.',
    BOARD_ID_UNAVAILABLE: 'Board ID is not available. Ensure a board has been created.',
    CARD_ID_UNAVAILABLE: 'Card ID is not available. Ensure a card has been created.',
    LIST_ID_UNAVAILABLE: 'List ID is not available. Ensure a board with lists has been created.',
    BOARD_NAME_UNAVAILABLE: 'Board name is not available. Ensure a board has been created.',
}

// Centralized API error messages
export const API_ERRORS = {
    EXPECTED_STATUS: (expected: number, actual: number) => `Expected ${expected} success status but got ${actual}`,
    EXPECTED_200_STATUS: (actual: number) => `Expected 200 success status but got ${actual}`,
    EXPECTED_404_STATUS: (actual: number) => `Expected 404 status for not found resource but got ${actual}`,
    UNAUTHORIZED: (actual: number) => `Expected 401 or 403 status for unauthorized request but got ${actual}`,
    INVALID_KEY_MESSAGE: (bodyText: string) => `Expected message "invalid key" but got "${bodyText}"`,
    BOARD_NOT_FOUND_MESSAGE: (bodyText: string) => `Expected message "Board not found" but got "${bodyText}"`
};