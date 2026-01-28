// This is the Trello Card API Page Object. It structures API interactions related to Trello cards.

import { APIRequestContext, APIResponse, request } from '@playwright/test';
import 'dotenv/config';
import { TrelloAuth, getTrelloAuth, getBaseUrl } from '../trelloClient';
import { TrelloApiPage } from './baseApiPage';

// TrelloCardPage class to manage Trello card operations via API
export class TrelloCardPage extends TrelloApiPage {
    private constructor(apiRequestContext: APIRequestContext, trelloAuth: TrelloAuth) {
        super(apiRequestContext, trelloAuth);
    }

    // Factory method to create an instance of TrelloCardPage. Builds context + auth.
    static async create(): Promise<TrelloCardPage> {
        const trelloAuth = getTrelloAuth();
        const baseURL = getBaseUrl();

        const apiRequestContext = await request.newContext({
            baseURL,
        });

        return new TrelloCardPage(apiRequestContext, trelloAuth);
    }

    // Method to create an instance from an existing APIRequestContext. Uses existing context + builds auth.
    static fromContext(apiRequestContext: APIRequestContext): TrelloCardPage {
        const trelloAuth = getTrelloAuth();
        return new TrelloCardPage(apiRequestContext, trelloAuth);
    }

    async createCard(listId: string, cardName?: string): Promise<APIResponse> {
        const name = cardName ?? 'Card_' + Math.random().toString(36).substring(2, 8);
        const postUrl = this.buildUrl('cards');
        const response = await this.apiRequestContext.post(postUrl, {
            form: {
                idList: listId,
                name,
            },
        });
        await this.assertSuccess(response, 200);
        return response;
    }

    ensureValidCardId(cardId: string): void {
        if (!cardId || cardId.length === 0) {
            throw new Error('Card ID is invalid or missing. Ensure a card has been created before performing this operation.');
        }
    }

    async extractCardId(response: APIResponse): Promise<string> {
        const jsonData = await response.json();
        if (!jsonData.id) {
            throw new Error('Response from card creation does not contain id');
        }
        const cardId = jsonData.id;
        this.ensureValidCardId(cardId);
        return cardId;
    }

    async getCard(cardId: string): Promise<APIResponse> {
        this.ensureValidCardId(cardId);
        const getUrl = this.buildUrl(`cards/${cardId}`);
        return this.apiRequestContext.get(getUrl);
    }

    async assertCardName(response: APIResponse, expectedName: string): Promise<void> {
        const jsonData = await response.json();
        if (jsonData.name !== expectedName) {
            throw new Error(`Expected card name "${expectedName}" but got ${jsonData.name}\nResponse id: ${jsonData.id}`);
        }
    }

    async assertCardId(response: APIResponse, expectedCardId: string): Promise<void> {
        const jsonData = await response.json();
        if (jsonData.id !== expectedCardId) {
            throw new Error(`Expected card ID ${expectedCardId} but got ${jsonData.id}\nResponse name: ${jsonData.name}`);
        }
    }

    async updateCard(cardId: string, newCardName: string, listId: string, description = 'Updated description'): Promise<APIResponse> {
        this.ensureValidCardId(cardId);
        const putUrl = this.buildUrl(`cards/${cardId}`);
        const response = await this.apiRequestContext.put(putUrl, {
            form: {
                idList: listId,
                name: newCardName,
                desc: description,
            },
        });
        await this.assertSuccess(response, 200);
        return response;
    }

    async deleteCard(cardId: string): Promise<APIResponse> {
        this.ensureValidCardId(cardId);

        const deleteUrl = this.buildUrl(`cards/${cardId}`);
        return this.apiRequestContext.delete(deleteUrl);
    }

    async assertCardDeleted(cardId: string): Promise<void> {
        this.ensureValidCardId(cardId);
        const response = await this.getCard(cardId);
        if (response.status() !== 404) {
            throw new Error(`Expected 404 status for deleted card but got ${response.status()}`);
        }
    }
}

