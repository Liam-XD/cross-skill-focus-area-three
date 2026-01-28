// This file contains helper functions to interact with the Trello API for board and list management.

import { APIResponse, request } from '@playwright/test';
import { API_ERRORS } from './helpers';

// TrelloAuth interface to hold API credentials
export interface TrelloAuth {
    key: string;
    token: string;
}

// Cache for Trello auth credentials to avoid repeated parsing
let cachedTrelloAuth: TrelloAuth | null = null;

// Function to retrieve Trello API credentials from environment variables (cached)
export function getTrelloAuth(): TrelloAuth {
    if (cachedTrelloAuth) {
        return cachedTrelloAuth;
    }

    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_API_TOKEN;

    if (!key || !token) {
        throw new Error('Trello API credentials (TRELLO_API_KEY/TRELLO_API_TOKEN) are missing');
    }

    cachedTrelloAuth = { key, token };
    return cachedTrelloAuth;
}

// Function to get the base URL for Trello API from environment variables
export function getBaseUrl(): string {
    const baseURL = process.env.TRELLO_API_BASE_URL;
    if (!baseURL) {
        throw new Error('Trello API base URL (TRELLO_API_BASE_URL) is missing');
    }
    return baseURL;
}

/**
 * Retrieve all list IDs on a given Trello board.
 * @param boardId - The board ID/shortLink to fetch lists for
 * @returns Array of list IDs
 */
export async function getListsOnABoard(boardId: string): Promise<string[]> {
    const trelloAuth = getTrelloAuth();
    const baseURL = getBaseUrl();
    const apiRequestContext = await request.newContext({ baseURL });

    try {
        const getUrl = `boards/${boardId}/lists?key=${trelloAuth.key}&token=${trelloAuth.token}`;
        const response = await apiRequestContext.get(getUrl);
        if (response.status() !== 200) {
            throw new Error(API_ERRORS.EXPECTED_200_STATUS(response.status()));
        }
        const jsonData = await response.json();
        const listIds = jsonData.map((list: any) => list.id).filter(Boolean); // Extract and filter valid list IDs
        return listIds;
    } finally {
        await apiRequestContext.dispose();
    }
}

/**
 * Delete all Trello boards for the authenticated user.
 * Boards are deleted in parallel for better performance.
 * WARNING: This is a destructive operation that deletes ALL boards. Not only those created during tests.
 */
export async function deleteAllBoards(): Promise<void> {
    const trelloAuth = getTrelloAuth();
    const baseURL = getBaseUrl();
    const apiRequestContext = await request.newContext({ baseURL });

    try {
        const getUrl = `members/me/boards?key=${trelloAuth.key}&token=${trelloAuth.token}`;
        const membersResponse = await apiRequestContext.get(getUrl);
        const json = await membersResponse.json();
        const shortLinks = json.map((board: any) => board.shortLink).filter(Boolean); // Extracts the shortLink for each board and filters out invalid ones.

        // Delete all boards in parallel
        const deletePromises = shortLinks.map(async (shortLink: string) => {
            const deleteUrl = `boards/${shortLink}?key=${trelloAuth.key}&token=${trelloAuth.token}`;
            const deleteResponse: APIResponse = await apiRequestContext.delete(deleteUrl);
            if (deleteResponse.status() !== 200) {
                throw new Error(API_ERRORS.EXPECTED_200_STATUS(deleteResponse.status()));
            }
        });

        await Promise.all(deletePromises);
    } finally {
        await apiRequestContext.dispose();
    }
}
