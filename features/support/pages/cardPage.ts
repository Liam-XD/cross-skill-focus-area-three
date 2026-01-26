import { APIRequestContext, APIResponse, request } from '@playwright/test';
import 'dotenv/config';

interface TrelloAuth {
    key: string;
    token: string;
}

export class TrelloCardPage {
    private apiRequestContext: APIRequestContext;
    private trelloAuth: TrelloAuth;

    private constructor(apiRequestContext: APIRequestContext, trelloAuth: TrelloAuth) {
        this.apiRequestContext = apiRequestContext;
        this.trelloAuth = trelloAuth;
    }

    static async create(): Promise<TrelloCardPage> {
        const key = process.env.TRELLO_API_KEY;
        const token = process.env.TRELLO_API_TOKEN;
        const baseURL = process.env.TRELLO_API_BASE_URL;

        if (!key || !token) {
            throw new Error('Trello API credentials (TRELLO_API_KEY/TRELLO_API_TOKEN) are missing');
        }

        if (!baseURL) {
            throw new Error('Trello API base URL (TRELLO_API_BASE_URL) is missing');
        }

        const apiRequestContext = await request.newContext({
            baseURL,
        });

        return new TrelloCardPage(apiRequestContext, { key, token });
    }

    async createCard(listId: string, cardName?: string): Promise<APIResponse> {
        const name = cardName ?? 'Card_' + Math.random().toString(36).substring(2, 8);
        const params = {
            idList: listId,
            name,
            key: this.trelloAuth.key,
            token: this.trelloAuth.token,
        };
        const postUrl = `cards`;
        return this.apiRequestContext.post(postUrl, {
            form: params,
        });
    }

    ensureValidCardId(cardId: string): void {
        if (!cardId) {
            throw new Error('Card ID is invalid or missing. Ensure a card has been created before performing this operation.');
        }
    }

    async extractCardId(response: APIResponse): Promise<string> {
        const jsonData = await response.json();
        if (!jsonData.id) {
            throw new Error('Response from card creation does not contain id');
        }
        const cardId: string = jsonData.id;
        this.ensureValidCardId(cardId);
        return cardId;
    }

    async getCard(cardId: string): Promise<APIResponse> {
        this.ensureValidCardId(cardId);
        const params = {
            key: this.trelloAuth.key,
            token: this.trelloAuth.token,
        };

        const getUrl = `cards/${cardId}?${new URLSearchParams(params).toString()}`;
        return this.apiRequestContext.get(getUrl);
    }

    async assertCardName(response: APIResponse, expectedName: string): Promise<void> {
        const jsonData = await response.json();
        if (jsonData.name !== expectedName) {
            throw new Error(`Expected card name "${expectedName}" but got ${jsonData.name}`);
        }
    }

    async assertCardId(response: APIResponse, expectedCardId: string): Promise<void> {
        const jsonData = await response.json();
        if (jsonData.id !== expectedCardId) {
            throw new Error(`Expected card ID ${expectedCardId} but got ${jsonData.id}`);
        }
    }

    async updateCardName(cardId: string, newCardName: string, listId: string, description: string = 'Updated description'): Promise<APIResponse> {
        this.ensureValidCardId(cardId);
        const params = {
            key: this.trelloAuth.key,
            token: this.trelloAuth.token,
        };

        const putUrl = `cards/${cardId}?${new URLSearchParams(params).toString()}`;
        return this.apiRequestContext.put(putUrl, {
            form: {
                idList: listId,
                name: newCardName,
                desc: description,
            },
        });
    }

    async deleteCard(cardId: string): Promise<APIResponse> {
        this.ensureValidCardId(cardId);
        const params = {
            key: this.trelloAuth.key,
            token: this.trelloAuth.token,
        };

        const deleteUrl = `cards/${cardId}?${new URLSearchParams(params).toString()}`;
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

