import { AfterAll, Before } from '@cucumber/cucumber';
import { request } from '@playwright/test';
import 'dotenv/config';
import { createBoard, deleteAllBoards, getListsOnABoard } from './trelloClient';

Before({ tags: '@board' }, async function () {
    // Create a Trello board before tagged scenarios using the Trello client helper
    const { boardId, boardName } = await createBoard();

    // Expose values via the Cucumber World
    this.boardId = boardId;
    this.boardName = boardName;
});

Before({ tags: '@card' }, async function () {

    this.apiRequestContext = await request.newContext({
        baseURL: process.env.TRELLO_API_BASE_URL!,
    });
    // Create a Trello board before tagged scenarios using the Trello client helper
    const { boardId, boardName } = await createBoard();
    const lists = await getListsOnABoard(boardId);
    if (lists.length === 0) {
        throw new Error('No lists found on the newly created board');
    }

    this.boardId = boardId;
    this.boardName = boardName;
    this.listId = lists[0]; // Use the first list for card operations

    // Create a card on the first list so scenarios have a valid card ID available
    const cardName = 'New_Card';
    const params = {
        idList: this.listId,
        name: cardName,
        key: process.env.TRELLO_API_KEY!,
        token: process.env.TRELLO_API_TOKEN!,
    };

    const postUrl = `cards`;
    const response = await this.apiRequestContext.post(postUrl, {
        form: params,
    });

    if (response.status() !== 200) {
        throw new Error(`Expected 200 success status when creating card in @card hook but got ${response.status()}`);
    }

    const jsonData = await response.json();
    if (!jsonData.id) {
        throw new Error('Response from card creation in @card hook does not contain id');
    }

    this.cardId = jsonData.id;

    // Expose values via the Cucumber World
    this.boardId = boardId;
    this.boardName = boardName;
});

AfterAll(async function () {
    // Clean up created boards after all tests have run using the Trello client helper
    await deleteAllBoards();
});