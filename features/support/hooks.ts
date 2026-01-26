import { AfterAll, After, Before } from '@cucumber/cucumber';
import { request } from '@playwright/test';
import 'dotenv/config';
import { deleteAllBoards, getListsOnABoard, getBaseUrl } from './trelloClient';
import { TrelloBoardPage } from './pages/boardPage';

// Shared APIRequestContext for @board and @card scenarios
Before({ tags: '@board or @card' }, async function () {
    const baseURL = getBaseUrl();
    this.apiRequestContext = await request.newContext({ baseURL });
});


Before({ tags: '@board' }, async function () {
    // Create a Trello board before tagged scenarios using the TrelloBoardPage
    const boardPage = TrelloBoardPage.fromContext(this.apiRequestContext);
    const response = await boardPage.createBoard();
    const boardId = await boardPage.extractBoardId(response);
    const json = await response.json();
    const boardName = json.name;
    // Expose values via the Cucumber World
    this.boardId = boardId;
    this.boardName = boardName;
});

Before({ tags: '@card' }, async function () {
    // Create a Trello board before tagged scenarios using the TrelloBoardPage
    const boardPage = TrelloBoardPage.fromContext(this.apiRequestContext);
    const response = await boardPage.createBoard();
    const boardId = await boardPage.extractBoardId(response);
    const json = await response.json();
    const boardName = json.name;
    const lists = await getListsOnABoard(boardId);
    if (lists.length === 0) {
        throw new Error('No lists found on the newly created board');
    }
    this.boardId = boardId;
    this.boardName = boardName;
    this.listId = lists[0]; // Use the first list for card operations
    // Create a card on the first list so scenarios have a valid card ID available
    // Use TrelloCardPage for card creation
    const { TrelloCardPage } = require('./pages/cardPage');
    const cardPage = TrelloCardPage.fromContext(this.apiRequestContext);
    const cardResponse = await cardPage.createCard(this.listId, 'New_Card');
    const cardJson = await cardResponse.json();
    if (!cardJson.id) {
        throw new Error('Response from card creation in @card hook does not contain id');
    }
    this.cardId = cardJson.id;
});

After({ tags: '@board or @card' }, async function () {
    await this.apiRequestContext?.dispose();
});

AfterAll({ timeout: 10000 }, async function () {
    // Clean up created boards after all tests have run using the Trello client helper
    await deleteAllBoards();
});