import { Given, When, Then } from '@cucumber/cucumber';
import { APIRequestContext, request } from '@playwright/test';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';


let apiRequestContext: APIRequestContext;
let response: any;
let requestBody: Record<string, any> = {};
let trelloAuth: { key: string; token: string };

Given('I am authenticated with the Trello API', async function () {
    trelloAuth = {
        key: process.env.TRELLO_API_KEY!,
        token: process.env.TRELLO_API_TOKEN!
    }
    apiRequestContext = await request.newContext({
        baseURL: process.env.TRELLO_API_BASE_URL!,
    });
});

When('I send a request to create a board', async function () {
    const boardName = "Board_" + Math.random().toString(36).substring(2, 8);
    const params = {
        name: boardName,
        key: trelloAuth.key,
        token: trelloAuth.token
    };
    // Build the request URL with query parameters
    const postUrl = `boards/?${new URLSearchParams(params).toString()}`;
    response = await apiRequestContext.post(postUrl);
});

Then('the API should return a success status', async function () {
    if (response.status() !== 200) {
        throw new Error(`Expected 200 success status but got ${response.status()}`);
    }
});

Then('the response should contain a valid board ID', async function () {
    const jsonData = await response.json();
    if (!jsonData.shortUrl) {
        throw new Error('Response does not contain shortUrl');
    }
    const boardId = jsonData.shortUrl.split('/').pop();
    if (!boardId || boardId.length === 0) {
        throw new Error('Board ID is invalid or missing');
    }
    this.boardId = boardId;

    // Persisting boardId to a temp file for use in other scenarios
    const tempFilePath = path.join(process.cwd(), 'board-id.txt');
    fs.writeFileSync(tempFilePath, boardId, 'utf-8');
});