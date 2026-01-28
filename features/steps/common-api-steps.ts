// This file contains common Cucumber step definitions for API response validations.

import { Then } from '@cucumber/cucumber';
import { assertDefined, API_ERRORS, ERRORS } from '../support/helpers';

Then('the API should return a success status', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    const status = response.status();
    if (status !== 200) {
        throw new Error(API_ERRORS.EXPECTED_200_STATUS(status));
    }
});

Then('the API should return a 404 status', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    const status = response.status();
    if (status !== 404) {
        throw new Error(API_ERRORS.EXPECTED_404_STATUS(status));
    }
});

Then('the response should contain a message "Board not found"', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    let bodyText;
    try {
        // Try to parse as JSON first
        const responseBody = await response.json();
        bodyText = responseBody.message || JSON.stringify(responseBody);
    } catch (err) {
        // Fallback to plain text if not JSON
        bodyText = await response.text();
    }
    if (!bodyText.includes('Board not found')) {
        throw new Error(API_ERRORS.BOARD_NOT_FOUND_MESSAGE(bodyText));
    }
});

Then('the API should return an unauthenticated or forbidden status', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    const status = response.status();
    if (status !== 401 && status !== 403) {
        throw new Error(API_ERRORS.UNAUTHORIZED(status));
    }
});

Then('the response should contain a message "invalid key"', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    let bodyText;
    try {
        // Try to parse as JSON first
        const responseBody = await response.json();
        bodyText = responseBody.message || JSON.stringify(responseBody);
    } catch (err) {
        // Fallback to plain text if not JSON
        bodyText = await response.text();
    }
    if (!bodyText.includes('invalid key')) {
        throw new Error(API_ERRORS.INVALID_KEY_MESSAGE(bodyText));
    }
});
