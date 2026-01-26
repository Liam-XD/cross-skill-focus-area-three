import { APIRequestContext, APIResponse, request } from '@playwright/test';
import 'dotenv/config';

interface TrelloAuth {
    key: string;
    token: string;
}

export class TrelloBoardPage {
    private apiRequestContext: APIRequestContext;
    private trelloAuth: TrelloAuth;

    private constructor(apiRequestContext: APIRequestContext, trelloAuth: TrelloAuth) {
        this.apiRequestContext = apiRequestContext;
        this.trelloAuth = trelloAuth;
    }

    static async create(): Promise<TrelloBoardPage> {
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

        return new TrelloBoardPage(apiRequestContext, { key, token });
    }

    async createBoard(boardName?: string): Promise<APIResponse> {
        const name = boardName ?? 'Board_' + Math.random().toString(36).substring(2, 8);

        const params = {
            name,
            key: this.trelloAuth.key,
            token: this.trelloAuth.token,
        };

        const postUrl = `boards/?${new URLSearchParams(params).toString()}`;
        return this.apiRequestContext.post(postUrl);
    }

    assertSuccess(response: APIResponse, expectedStatus: number = 200): void {
        if (response.status() !== expectedStatus) {
            throw new Error(`Expected ${expectedStatus} success status but got ${response.status()}`);
        }
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
        const params = {
            key: this.trelloAuth.key,
            token: this.trelloAuth.token,
        };

        const getUrl = `boards/${boardId}?${new URLSearchParams(params).toString()}`;
        return this.apiRequestContext.get(getUrl);
    }

    async assertBoardName(response: APIResponse, expectedName: string): Promise<void> {
        const jsonData = await response.json();
        if (jsonData.name !== expectedName) {
            throw new Error(`Expected board name ${expectedName} but got ${jsonData.name}`);
        }
    }

    async updateBoardName(boardId: string, newBoardName: string): Promise<APIResponse> {
        const params = {
            key: this.trelloAuth.key,
            token: this.trelloAuth.token,
        };

        const putUrl = `boards/${boardId}?${new URLSearchParams(params).toString()}`;
        return this.apiRequestContext.put(putUrl, {
            form: {
                name: newBoardName,
            },
        });
    }

    async deleteBoard(boardId: string): Promise<APIResponse> {
        const params = {
            key: this.trelloAuth.key,
            token: this.trelloAuth.token,
        };

        const deleteUrl = `boards/${boardId}?${new URLSearchParams(params).toString()}`;
        return this.apiRequestContext.delete(deleteUrl);
    }

    async assertBoardDeleted(boardId: string): Promise<void> {
        const response = await this.getBoard(boardId);
        if (response.status() !== 404) {
            throw new Error(`Expected 404 status for deleted board but got ${response.status()}`);
        }
    }
}
