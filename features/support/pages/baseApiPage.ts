// This is the Trello API Page Objects base class. It provides common functionality for Trello API interactions.

import 'dotenv/config';
import { APIRequestContext, APIResponse } from '@playwright/test';
import { TrelloAuth } from '../trelloClient';
import { API_ERRORS } from '../helpers';

export abstract class TrelloApiPage {
    protected apiRequestContext: APIRequestContext;
    protected trelloAuth: TrelloAuth;

    protected constructor(apiRequestContext: APIRequestContext, trelloAuth: TrelloAuth) {
        this.apiRequestContext = apiRequestContext;
        // Create a shallow copy to avoid mutating the shared cached object. Stops calling setInvalidApiKey from affecting setup.
        this.trelloAuth = { ...trelloAuth };
    }

    async assertSuccess(response: APIResponse, expectedStatus = 200): Promise<void> {
        if (response.status() !== expectedStatus) {
            let bodyText = '';
            try {
                bodyText = await response.text();
            } catch (error) {
                bodyText = '[unavailable]';
            }
            const statusError = API_ERRORS.EXPECTED_STATUS(expectedStatus, response.status());
            throw new Error(`${statusError}\nResponse body: ${bodyText}`);
        }
    }

    // Helper to build Trello API URLs with auth and parameters
    protected buildUrl(path: string, params: Record<string, string | undefined> = {}): string { //Key must be string, value can be string or undefined
        const query = new URLSearchParams();
        query.set('key', this.trelloAuth.key);
        query.set('token', this.trelloAuth.token);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) query.append(key, value);
        });

        return `${path}?${query.toString()}`;
    }
}
