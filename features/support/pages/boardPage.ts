// This is the Trello Board API Page Object. It structures API interactions related to Trello boards.

import { APIRequestContext, APIResponse, request } from '@playwright/test';
import 'dotenv/config';
import { TrelloAuth, getTrelloAuth, getBaseUrl } from '../trelloClient';
import { TrelloApiPage } from './baseApiPage';

// TrelloBoardPage class to manage Trello board operations via API
export class TrelloBoardPage extends TrelloApiPage {
    private constructor(apiRequestContext: APIRequestContext, trelloAuth: TrelloAuth) {
        super(apiRequestContext, trelloAuth);
    }

    // Factory method to create an instance of TrelloBoardPage. Builds context + auth.
    static async create(): Promise<TrelloBoardPage> {
        const trelloAuth = getTrelloAuth();
        const baseURL = getBaseUrl();

        const apiRequestContext = await request.newContext({
            baseURL,
        });

        return new TrelloBoardPage(apiRequestContext, trelloAuth);
    }

    // Method to create an instance from an existing APIRequestContext. Uses existing context + builds auth.
    static fromContext(apiRequestContext: APIRequestContext): TrelloBoardPage {
        const trelloAuth = getTrelloAuth();
        return new TrelloBoardPage(apiRequestContext, trelloAuth);
    }

    async createBoard(boardName?: string): Promise<APIResponse> {
        const name = boardName ?? 'Board_' + Math.random().toString(36).substring(2, 8);
        const postUrl = this.buildUrl('boards/', { name });
        const response = await this.apiRequestContext.post(postUrl);
        await this.assertSuccess(response, 200);
        return response;
    }

    async unauthorizedCreateBoard(boardName?: string): Promise<APIResponse> {
        const name = boardName ?? 'Board_' + Math.random().toString(36).substring(2, 8);
        const postUrl = this.buildUrl('boards/', { name });
        const response = await this.apiRequestContext.post(postUrl);
        await this.assertSuccess(response, 401);
        return response;
    }

    async extractBoardId(response: APIResponse): Promise<string> {
        const jsonData = await response.json();
        if (!jsonData.shortUrl) {
            throw new Error('Response does not contain shortUrl');
        }
        const boardId = jsonData.shortUrl.split('/').pop();
        if (!boardId || boardId.length === 0) {
            throw new Error('Board ID is invalid or missing');
        }
        return boardId;
    }

    async getBoard(boardId: string): Promise<APIResponse> {
        const getUrl = this.buildUrl(`boards/${boardId}`);
        return this.apiRequestContext.get(getUrl);
    }

    async assertBoardName(response: APIResponse, expectedName: string): Promise<void> {
        const jsonData = await response.json();
        if (jsonData.name !== expectedName) {
            throw new Error(`Expected board name ${expectedName} but got ${jsonData.name}\nResponse id: ${jsonData.id}\nShort URL: ${jsonData.shortUrl}`);
        }
    }

    async updateBoardName(boardId: string, newBoardName: string): Promise<APIResponse> {
        const putUrl = this.buildUrl(`boards/${boardId}`);
        const response = await this.apiRequestContext.put(putUrl, {
            form: {
                name: newBoardName,
            },
        });
        await this.assertSuccess(response, 200);
        return response;
    }

    async updateDeletedBoardName(boardId: string, newBoardName: string): Promise<APIResponse> {
        const putUrl = this.buildUrl(`boards/${boardId}`);
        const response = await this.apiRequestContext.put(putUrl, {
            form: {
                name: newBoardName,
            },
        });
        await this.assertSuccess(response, 404);
        return response;
    }

    async deleteBoard(boardId: string): Promise<APIResponse> {
        const deleteUrl = this.buildUrl(`boards/${boardId}`);
        const response = await this.apiRequestContext.delete(deleteUrl);

        // Log unexpected errors before asserting
        if (response.status() !== 200) {
            let responseBody = '[Fallback body as unable to read from response]';
            try {
                responseBody = await response.text();
            } catch {
                // Ignore if body couldn't be read as we have a fallback value set
            }
            console.error(`Failed to delete board ${boardId}. Status: ${response.status()}. Response body: ${responseBody}`);
        }

        await this.assertSuccess(response, 200);
        return response;
    }

    async assertBoardDeleted(boardId: string): Promise<void> {
        const response = await this.getBoard(boardId);
        if (response.status() !== 404) {
            throw new Error(`Expected 404 status for deleted board but got ${response.status()}`);
        }
    }

    async setInvalidApiKey(invalidKey: string): Promise<void> {
        this.trelloAuth.key = invalidKey;
    }
}
