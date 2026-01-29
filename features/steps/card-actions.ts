// This file contains Cucumber step definitions for Trello card actions.

import { Given, When, Then } from '@cucumber/cucumber';
import 'dotenv/config';
import { assertDefined, ERRORS } from '../support/helpers';
import { getListsOnABoard } from '../support/trelloClient';

// --- Setup for card creation scenarios ---
Given('I have a valid board ID and list ID', async function () {
    if (this.boardId && this.listId) {
        // IDs already set up by hooks
        return;
    }
    const boardPage = this.boardPage;
    const response = await boardPage.createBoard();
    const boardId = await boardPage.extractBoardId(response);

    const lists = await getListsOnABoard(boardId);

    const validBoardId = assertDefined(boardId, ERRORS.BOARD_ID_UNAVAILABLE);
    const listId = assertDefined(lists[0], ERRORS.LIST_ID_UNAVAILABLE);

    this.boardId = validBoardId;
    this.listId = listId;
});

// --- Create Card & Assert ID ---
When('I send a request to create a card', async function () {
    const listId = assertDefined(this.listId, ERRORS.LIST_ID_UNAVAILABLE);
    this.response = await this.cardPage.createCard(listId);
});

Then('the response should contain a valid card ID', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    const cardId = await this.cardPage.extractCardId(response);
    this.cardId = cardId;
});

// --- Validate Card ID ---
Given('I have a valid card ID', async function () {
    const cardId = assertDefined(this.cardId, ERRORS.CARD_ID_UNAVAILABLE);
    this.cardPage.ensureValidCardId(cardId);
});

// --- Retrieve Card & Assert Info ---
When('I send a request to retrieve the card details', async function () {
    const cardId = assertDefined(this.cardId, ERRORS.CARD_ID_UNAVAILABLE);
    this.response = await this.cardPage.getCard(cardId);
});

Then('the response should contain the correct card information', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    const cardId = assertDefined(this.cardId, ERRORS.CARD_ID_UNAVAILABLE);
    await this.cardPage.assertCardId(response, cardId);
});

// --- Update Card & Assert Name ---
When('I send a request to update the card\'s name', async function () {
    const newCardName = "Updated Card Name";
    const cardId = assertDefined(this.cardId, ERRORS.CARD_ID_UNAVAILABLE);
    const listId = assertDefined(this.listId, ERRORS.LIST_ID_UNAVAILABLE);
    this.response = await this.cardPage.updateCard(cardId, newCardName, listId, "Updated description");
});

Then('the response should reflect the updated card name', async function () {
    const response = assertDefined(this.response, ERRORS.RESPONSE_UNAVAILABLE);
    await this.cardPage.assertCardName(response, "Updated Card Name");
});

// --- Delete Card & Assert Deleted ---
When('I send a request to delete the card', async function () {
    const cardId = assertDefined(this.cardId, ERRORS.CARD_ID_UNAVAILABLE);
    this.response = await this.cardPage.deleteCard(cardId);
});

Then('the card should no longer exist when I attempt to retrieve it', async function () {
    const cardId = assertDefined(this.cardId, ERRORS.CARD_ID_UNAVAILABLE);
    await this.cardPage.assertCardDeleted(cardId);

    // Clear cardId so After hook doesn't try to delete an already-deleted card
    this.cardId = undefined;
});