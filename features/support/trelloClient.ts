import { APIResponse, request } from '@playwright/test';

export interface TrelloAuth {
    key: string;
    token: string;
}

export function getTrelloAuth(): TrelloAuth {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_API_TOKEN;

    if (!key || !token) {
        throw new Error('Trello API credentials (TRELLO_API_KEY/TRELLO_API_TOKEN) are missing');
    }

    return { key, token };
}

export function getBaseUrl(): string {
    const baseURL = process.env.TRELLO_API_BASE_URL;
    if (!baseURL) {
        throw new Error('Trello API base URL (TRELLO_API_BASE_URL) is missing');
    }
    return baseURL;
}

export async function getListsOnABoard(boardId: string): Promise<string[]> {
    const trelloAuth = getTrelloAuth();
    const baseURL = getBaseUrl();
    const apiRequestContext = await request.newContext({ baseURL });
    const getUrl = `boards/${boardId}/lists?key=${trelloAuth.key}&token=${trelloAuth.token}`;
    const response = await apiRequestContext.get(getUrl);
    if (response.status() !== 200) {
        throw new Error(`Expected 200 success status when retrieving lists but got ${response.status()}`);
    }
    const jsonData = await response.json();
    const listIds = jsonData.map((list: any) => list.id).filter(Boolean);
    return listIds;
}

export async function deleteAllBoards(): Promise<void> {
    const trelloAuth = getTrelloAuth();
    const baseURL = getBaseUrl();
    const apiRequestContext = await request.newContext({ baseURL });
    const getUrl = `members/me/boards?key=${trelloAuth.key}&token=${trelloAuth.token}`;
    const membersResponse = await apiRequestContext.get(getUrl);
    const json = await membersResponse.json();
    const shortLinks = json.map((b: any) => b.shortLink).filter(Boolean);
    for (const shortLink of shortLinks) {
        const deleteUrl = `boards/${shortLink}?key=${trelloAuth.key}&token=${trelloAuth.token}`;
        const deleteResponse: APIResponse = await apiRequestContext.delete(deleteUrl);
        if (deleteResponse.status() !== 200) {
            console.warn(`Warning: Expected 200 success status when deleting board ${shortLink} but got ${deleteResponse.status()}`);
        }
    }
}
