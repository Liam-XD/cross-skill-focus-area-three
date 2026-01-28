// This file contains Cucumber hooks to manage Trello boards and cards for test scenarios.
import { AfterAll, After, BeforeAll, Before } from '@cucumber/cucumber';
import { request } from '@playwright/test';
import 'dotenv/config';
import { deleteAllBoards, getListsOnABoard, getBaseUrl } from './trelloClient';
import { assertDefined, validateEnvVars, ERRORS } from './helpers';
import { TestWorld } from './world';

// Validate required environment variables before all tests
BeforeAll(async function () {
    validateEnvVars();
});

// Shared APIRequestContext for @board and @card scenarios.
//A Shared APIRequestContext is a single HTTP connection/session that's created once per scenario and reused for all API calls within that scenario.
Before<TestWorld>({ tags: '@board or @card' }, async function () {
    const baseURL = getBaseUrl(); // Get base URL from env
    this.apiRequestContext = await request.newContext({ baseURL }); // Create shared context
});

Before<TestWorld>({ tags: '@board and not @board-create' }, async function () {
    // Create a Trello board before tagged scenarios using the TrelloBoardPage
    // Skipped for @board-create scenarios that create their own board
    const boardPage = this.boardPage;
    const response = await boardPage.createBoard();
    const boardId = await boardPage.extractBoardId(response);
    const json = await response.json();
    const boardName = json.name;
    // Expose values via Cucumber World
    this.boardId = boardId;
    this.boardName = boardName;
});

Before<TestWorld>({ tags: '@card' }, async function () {
    // Create a Trello board and retrieve lists for @card scenarios
    const boardPage = this.boardPage;
    const response = await boardPage.createBoard();
    const boardId = await boardPage.extractBoardId(response);
    const json = await response.json();
    const boardName = json.name;

    // Retrieve lists on the newly created board
    const lists = await getListsOnABoard(boardId);
    if (lists.length === 0) {
        throw new Error('No lists found on the newly created board');
    }
    this.boardId = boardId;
    this.boardName = boardName;
    this.listId = lists[0]; // Use the first list for card operations
});

Before<TestWorld>({ tags: '@card and not @card-create' }, async function () {
    // Create a card on the first list so scenarios have a valid card ID available
    // Skipped for @card-create scenarios that create their own card
    const listId = assertDefined(this.listId, ERRORS.LIST_ID_UNAVAILABLE);
    const cardPage = this.cardPage;
    const cardResponse = await cardPage.createCard(listId, 'New_Card');
    const cardJson = await cardResponse.json();
    if (!cardJson.id) {
        throw new Error('Response from card creation in @card hook does not contain id');
    }
    this.cardId = cardJson.id;
});

After<TestWorld>({ tags: '@board or @card' }, async function () {
    // Dispose of the shared APIRequestContext after tagged scenarios
    await this.apiRequestContext?.dispose();
    this.apiRequestContext = undefined;
});

AfterAll({ timeout: 10000 }, async function () {
    // Clean up created boards after all tests have run
    await deleteAllBoards();
});