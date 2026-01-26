import { APIRequestContext, APIResponse } from '@playwright/test';
import { TrelloAuth } from '../trelloClient';

export abstract class TrelloApiPage {
    protected apiRequestContext: APIRequestContext;
    protected trelloAuth: TrelloAuth;

    protected constructor(apiRequestContext: APIRequestContext, trelloAuth: TrelloAuth) {
        this.apiRequestContext = apiRequestContext;
        this.trelloAuth = trelloAuth;
    }

    assertSuccess(response: APIResponse, expectedStatus: number = 200): void {
        if (response.status() !== expectedStatus) {
            throw new Error(`Expected ${expectedStatus} success status but got ${response.status()}`);
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
