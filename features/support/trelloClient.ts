// This file contains helper functions to interact with the Trello API for board and list management.

import { APIResponse, request } from '@playwright/test';

// TrelloAuth interface to hold API credentials
export interface TrelloAuth {
    key: string;
    token: string;
}

// Function to retrieve Trello API credentials from environment variables
export function getTrelloAuth(): TrelloAuth {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_API_TOKEN;

    if (!key || !token) {
        throw new Error('Trello API credentials (TRELLO_API_KEY/TRELLO_API_TOKEN) are missing');
    }

    return { key, token };
}

// Function to get the base URL for Trello API from environment variables
export function getBaseUrl(): string {
    const baseURL = process.env.TRELLO_API_BASE_URL;
    if (!baseURL) {
        throw new Error('Trello API base URL (TRELLO_API_BASE_URL) is missing');
    }
    return baseURL;
}

// Function to retrieve all list IDs on a given Trello board
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
    const listIds = jsonData.map((list: any) => list.id).filter(Boolean); // Extract and filter valid list IDs
    return listIds;
}

// Function to delete all Trello boards for the authenticated user
export async function deleteAllBoards(): Promise<void> {
    const trelloAuth = getTrelloAuth();
    const baseURL = getBaseUrl();
    const apiRequestContext = await request.newContext({ baseURL });
    const getUrl = `members/me/boards?key=${trelloAuth.key}&token=${trelloAuth.token}`;
    const membersResponse = await apiRequestContext.get(getUrl);
    const json = await membersResponse.json();
    const shortLinks = json.map((board: any) => board.shortLink).filter(Boolean); // Extract and filter valid shortLinks
    for (const shortLink of shortLinks) {
        const deleteUrl = `boards/${shortLink}?key=${trelloAuth.key}&token=${trelloAuth.token}`;
        const deleteResponse: APIResponse = await apiRequestContext.delete(deleteUrl);
        if (deleteResponse.status() !== 200) {
            console.warn(`Warning: Expected 200 success status when deleting board ${shortLink} but got ${deleteResponse.status()}`);
        }
    }
}
