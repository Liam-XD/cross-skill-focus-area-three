// This is the base class for Trello API Page Objects

import { APIRequestContext, APIResponse } from '@playwright/test';
import { TrelloAuth } from '../trelloClient';

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
            throw new Error(`Expected ${expectedStatus} success status but got ${response.status()}\nResponse body: ${bodyText}`);
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
