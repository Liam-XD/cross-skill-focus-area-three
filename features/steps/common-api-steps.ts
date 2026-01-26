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
