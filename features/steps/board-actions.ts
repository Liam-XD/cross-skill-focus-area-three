// This file contains Cucumber step definitions for Trello board actions.

import { Given, When, Then } from '@cucumber/cucumber';
import 'dotenv/config';
import { assertDefined, ERRORS } from '../support/helpers';

// --- Setup & Board Creation ---
Given('I am authenticated with the Trello API', async function () {
    this.boardPage;
});

When('I send a request to create a board', async function () {
    this.response = await this.boardPage.createBoard();
});

Then('the response should contain a valid board ID', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    this.boardId = await this.boardPage.extractBoardId(response);
});

When('I send an unauthorized request to create a board', async function () {
    this.response = await this.boardPage.unauthorizedCreateBoard();
});

Given('I have a valid board ID', async function () {
    assertDefined(this.boardId, ERRORS.BOARD_ID_UNAVAILABLE);
});

Given('I am using an invalid Trello API key', async function () {
    this.boardPage.setInvalidApiKey('invalid_key');
});

// --- Board Update & Retrieval ---
When('I send a request to update the board\'s name', async function () {
    const newBoardName = "Updated Board Name";
    const boardId = assertDefined(this.boardId, ERRORS.BOARD_ID_UNAVAILABLE);
    this.response = await this.boardPage.updateBoardName(boardId, newBoardName);
});

When('I send a request to update the deleted board\'s name', async function () {
    const newBoardName = "Deleted Board";
    const boardId = assertDefined(this.boardId, ERRORS.BOARD_ID_UNAVAILABLE);
    this.response = await this.boardPage.updateDeletedBoardName(boardId, newBoardName);
});

When('I send a request to retrieve the board details', async function () {
    const boardId = assertDefined(this.boardId, ERRORS.BOARD_ID_UNAVAILABLE);
    this.response = await this.boardPage.getBoard(boardId);
});

Then('the response should contain the correct board information', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    const boardName = assertDefined(this.boardName, ERRORS.BOARD_NAME_UNAVAILABLE);
    await this.boardPage.assertBoardName(response, boardName);
});

Then('the response should reflect the updated board name', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    await this.boardPage.assertBoardName(response, "Updated Board Name");
});

// --- Board Deletion ---
When('I send a request to delete the board', async function () {
    const boardId = assertDefined(this.boardId, ERRORS.BOARD_ID_UNAVAILABLE);
    this.response = await this.boardPage.deleteBoard(boardId);
});

Then('the board should no longer exist when I attempt to retrieve it', async function () {
    const boardId = assertDefined(this.boardId, ERRORS.BOARD_ID_UNAVAILABLE);
    await this.boardPage.assertBoardDeleted(boardId);
    // Clear boardId so After hook doesn't try to delete an already-deleted board
    this.boardId = undefined;
});