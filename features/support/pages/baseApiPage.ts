// This is the Trello API Page Objects base class. It provides common functionality for Trello API interactions.

import { APIRequestContext, APIResponse } from '@playwright/test';
import { TrelloAuth } from '../trelloClient';
import { API_ERRORS } from '../helpers';

export abstract class TrelloApiPage {
    protected apiRequestContext: APIRequestContext;
    protected trelloAuth: TrelloAuth;

    protected constructor(apiRequestContext: APIRequestContext, trelloAuth: TrelloAuth) {
        this.apiRequestContext = apiRequestContext;
        this.trelloAuth = trelloAuth;
    }

    async assertSuccess(response: APIResponse, expectedStatus: number = 200): Promise<void> {
        if (response.status() !== expectedStatus) {
            let bodyText = '';
            try {
                bodyText = await response.text();
            } catch (error) {
                bodyText = '[unavailable]';
            }
            const statusError = expectedStatus === 200 ? API_ERRORS.EXPECTED_200_STATUS(response.status()) : `Expected ${expectedStatus} success status but got ${response.status()}`;
            throw new Error(`${statusError}\nResponse body: ${bodyText}`);
        }
    }

    protected buildUrl(path: string, params: Record<string, string | undefined> = {}): string {
        const allParams = {
            key: this.trelloAuth.key,
            token: this.trelloAuth.token,
            ...params,
        };
        return `${path}?${new URLSearchParams(allParams).toString()}`;
    }
}
