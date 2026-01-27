// This file contains common Cucumber step definitions for API response validations.

import { Then } from '@cucumber/cucumber';

Then('the API should return a success status', async function () {
    if (!this.response) {
        throw new Error('Response is not available on the World. Ensure a request step has run before this assertion.');
    }

    const status = this.response.status();
    if (status !== 200) {
        throw new Error(`Expected 200 success status but got ${status}`);
    }
});

Then('the API should return a 404 status', async function () {
    if (!this.response) {
        throw new Error('Response is not available on the World. Ensure a request step has run before this assertion.');
    }

    const status = this.response.status();
    if (status !== 404) {
        throw new Error(`Expected 404 status but got ${status}`);
    }
});

Then('the response should contain a message "Board not found"', async function () {
    if (!this.response) {
        throw new Error('Response is not available on the World. Ensure a request step has run before this assertion.');
    }

    let bodyText;
    try {
        // Try to parse as JSON first
        const responseBody = await this.response.json();
        bodyText = responseBody.message || JSON.stringify(responseBody);
    } catch (err) {
        // Fallback to plain text if not JSON
        bodyText = await this.response.text();
    }
    if (!bodyText.includes('Board not found')) {
        throw new Error(`Expected message "Board not found" but got "${bodyText}"`);
    }
});

Then('the API should return an unauthenticated or forbidden status', async function () {
    if (!this.response) {
        throw new Error('Response is not available on the World. Ensure a request step has run before this assertion.');
    }

    const status = this.response.status();
    if (status !== 401 && status !== 403) {
        throw new Error(`Expected 401 or 403 status but got ${status}`);
    }
});

Then('the response should contain a message "invalid key"', async function () {
    if (!this.response) {
        throw new Error('Response is not available on the World. Ensure a request step has run before this assertion.');
    }

    let bodyText;
    try {
        // Try to parse as JSON first
        const responseBody = await this.response.json();
        bodyText = responseBody.message || JSON.stringify(responseBody);
    } catch (err) {
        // Fallback to plain text if not JSON
        bodyText = await this.response.text();
    }
    if (!bodyText.includes('invalid key')) {
        throw new Error(`Expected message "invalid key" but got "${bodyText}"`);
    }
});
