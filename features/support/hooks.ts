// This file contains Cucumber hooks to manage Trello boards and cards for test scenarios.
import { AfterAll, After, BeforeAll, Before } from '@cucumber/cucumber';
import { request } from '@playwright/test';
import 'dotenv/config';
import { getListsOnABoard, getBaseUrl } from './trelloClient';
import { assertDefined, validateEnvVars, ERRORS } from './helpers';
import { TestWorld } from './world';
import { TrelloBoardPage } from './pages/boardPage';

// Shared board for read-only scenarios
let sharedBoardId: string | undefined;
let sharedBoardName: string | undefined;
let sharedListId: string | undefined;

// Create shared board before all tests
BeforeAll(async function () {
    validateEnvVars(); // Ensure env vars are set
    const boardPage = await TrelloBoardPage.create(); //

    try {
        const response = await boardPage.createBoard();
        sharedBoardId = await boardPage.extractBoardId(response);
        const json = await response.json();
        sharedBoardName = json.name;

        const lists = await getListsOnABoard(sharedBoardId);
        if (lists.length > 0) {
            sharedListId = lists[0];
        }
    } catch (error) {
        console.error('Error creating shared board:', error);
        throw error;
    }
});

// Create API context for all @board and @card scenarios
Before<TestWorld>({ tags: '@board or @card' }, async function () {
    const baseURL = getBaseUrl();
    this.apiRequestContext = await request.newContext({ baseURL });
});

// Setup board: reuse shared board for read-only scenarios. Will only run for @board scenarios
Before<TestWorld>({ tags: '@board and not @board-create and not @board-destructive' }, async function () {
    this.boardId = assertDefined(sharedBoardId, 'Shared board not created');
    this.boardName = assertDefined(sharedBoardName, 'Shared board name not captured');
});

// Setup board: create new board for create/destructive scenarios. Will only run for scenarios tagged with @board and either @board-create or @board-destructive
Before<TestWorld>({ tags: '@board and (@board-create or @board-destructive)' }, async function () {
    const response = await this.boardPage.createBoard();
    const json = await response.json();
    this.boardId = await this.boardPage.extractBoardId(response);
    this.boardName = json.name;
});

// Setup board and list for card scenarios. Will only run for @card scenarios
Before<TestWorld>({ tags: '@card and not @card-create and not @card-destructive' }, async function () {
    this.boardId = assertDefined(sharedBoardId, 'Shared board not created');
    this.listId = assertDefined(sharedListId, 'Shared list not available');

    const response = await this.cardPage.createCard(this.listId, 'Shared_Card');
    const json = await response.json();
    this.cardId = assertDefined(json.id, 'Card creation response missing id');
});

// Setup board and list for create/destructive card scenarios. Will only run for scenarios tagged with @card and either @card-create or @card-destructive
Before<TestWorld>({ tags: '@card and (@card-create or @card-destructive)' }, async function () {
    const response = await this.boardPage.createBoard();
    const json = await response.json();
    this.boardId = await this.boardPage.extractBoardId(response);
    const lists = await getListsOnABoard(this.boardId);
    this.listId = assertDefined(lists[0], 'No lists found on new board');
});

// Create card for destructive card scenarios. Will only run for scenarios tagged with @card and @card-destructive
Before<TestWorld>({ tags: '@card and @card-destructive' }, async function () {
    const listId = assertDefined(this.listId, ERRORS.LIST_ID_UNAVAILABLE);
    const response = await this.cardPage.createCard(listId, 'Destructive_Card');
    const json = await response.json();
    this.cardId = assertDefined(json.id, 'Card creation response missing id');
});

// Cleanup: delete non-shared boards only. Will only run for scenarios tagged with @board or @card
After<TestWorld>({ tags: '@board or @card' }, async function () {
    if (this.boardId && this.boardId !== sharedBoardId) {
        // Check if board still exists before attempting to delete
        const boardResponse = await this.boardPage.getBoard(this.boardId);
        if (boardResponse.status() === 200) {
            // Board exists, delete it
            await this.boardPage.deleteBoard(this.boardId);
        }
    }

    await this.apiRequestContext?.dispose();
    this.apiRequestContext = undefined;
});

// Final cleanup - delete the shared board
AfterAll({ timeout: 10000 }, async function () {
    if (sharedBoardId) {
        try {
            const boardPage = await TrelloBoardPage.create();
            await boardPage.deleteBoard(sharedBoardId);
        } catch (error) {
            console.error(`Failed to delete shared board ${sharedBoardId}:`, error);
        }
    }
    sharedBoardId = undefined;
    sharedBoardName = undefined;
    sharedListId = undefined;
});