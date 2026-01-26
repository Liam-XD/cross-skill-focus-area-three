import { APIResponse, request } from '@playwright/test';

interface TrelloAuth {
    key: string;
    token: string;
}

function getTrelloAuth(): TrelloAuth {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_API_TOKEN;

    if (!key || !token) {
        throw new Error('Trello API credentials (TRELLO_API_KEY/TRELLO_API_TOKEN) are missing');
    }

    return { key, token };
}

function getBaseUrl(): string {
    const baseURL = process.env.TRELLO_API_BASE_URL;
    if (!baseURL) {
        throw new Error('Trello API base URL (TRELLO_API_BASE_URL) is missing');
    }
    return baseURL;
}

export async function createBoard(): Promise<{ boardId: string; boardName: string }> {
    const trelloAuth = getTrelloAuth();
    const baseURL = getBaseUrl();

    const apiRequestContext = await request.newContext({
        baseURL,
    });

    const boardName = 'Board_' + Math.random().toString(36).substring(2, 8);
    const params = {
        name: boardName,
        key: trelloAuth.key,
        token: trelloAuth.token,
    };

    const postUrl = `boards/?${new URLSearchParams(params).toString()}`;
    const response = await apiRequestContext.post(postUrl);

    if (response.status() !== 200) {
        throw new Error(`Expected 200 success status when creating board but got ${response.status()}`);
    }

    const jsonData = await response.json();
    if (!jsonData.shortUrl) {
        throw new Error('Response from board creation does not contain shortUrl');
    }

    const boardId = jsonData.shortUrl.split('/').pop();
    if (!boardId || boardId.length === 0) {
        throw new Error('Board ID from board creation is invalid or missing');
    }

    return { boardId, boardName };
}

export async function deleteAllBoards(): Promise<void> {
    const trelloAuth = getTrelloAuth();
    const baseURL = getBaseUrl();

    const apiRequestContext = await request.newContext({
        baseURL,
    });

    const params = {
        key: trelloAuth.key,
        token: trelloAuth.token,
    };

    const getUrl = `members/me/boards?${new URLSearchParams(params).toString()}`;
    const membersResponse = await apiRequestContext.get(getUrl);
    const json = await membersResponse.json();

    const shortLinks = json.map((b: any) => b.shortLink).filter(Boolean);

    for (const shortLink of shortLinks) {
        const deleteUrl = `boards/${shortLink}?${new URLSearchParams(params).toString()}`;
        const deleteResponse: APIResponse = await apiRequestContext.delete(deleteUrl);
        console.log(`Deleted board with shortLink: ${shortLink}`);
        if (deleteResponse.status() !== 200) {
            console.warn(`Warning: Expected 200 success status when deleting board ${shortLink} but got ${deleteResponse.status()}`);
        }
    }
}
