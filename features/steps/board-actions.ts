import { Given, When, Then } from '@cucumber/cucumber';
import 'dotenv/config';
import { TrelloBoardPage } from '../support/pages/boardPage';

async function getTrelloBoardPage(world: any): Promise<TrelloBoardPage> {
    if (!world.apiRequestContext) {
        throw new Error('APIRequestContext is not initialised on World. Ensure the Before hook creates it.');
    }

    if (!world.trelloBoardPage) {
        world.trelloBoardPage = TrelloBoardPage.fromContext(world.apiRequestContext);
    }

    return world.trelloBoardPage;
}

Given('I am authenticated with the Trello API', async function () {
    await getTrelloBoardPage(this);
});

When('I send a request to create a board', async function () {
    const boardPage = await getTrelloBoardPage(this);
    this.response = await boardPage.createBoard();
});

Then('the response should contain a valid board ID', async function () {
    const boardPage = await getTrelloBoardPage(this);
    this.boardId = await boardPage.extractBoardId(this.response);
});

Given('I have a valid board ID', async function () {
    if (!this.boardId) {
        throw new Error('Board ID is not available on the World. Ensure the @board hook has run and created a board.');
    }
});

When('I send a request to update the board\'s name', async function () {
    const newBoardName = "Updated Board Name";
    const boardPage = await getTrelloBoardPage(this);
    this.response = await boardPage.updateBoardName(this.boardId, newBoardName);
});

When('I send a request to retrieve the board details', async function () {
    const boardPage = await getTrelloBoardPage(this);
    this.response = await boardPage.getBoard(this.boardId);
});

Then('the response should contain the correct board information', async function () {
    const boardPage = await getTrelloBoardPage(this);
    await boardPage.assertBoardName(this.response, this.boardName);
});

Then('the response should reflect the updated board name', async function () {
    const boardPage = await getTrelloBoardPage(this);
    await boardPage.assertBoardName(this.response, "Updated Board Name");
});

When('I send a request to delete the board', async function () {
    const boardPage = await getTrelloBoardPage(this);
    this.response = await boardPage.deleteBoard(this.boardId);
});

Then('the board should no longer exist when I attempt to retrieve it', async function () {
    const boardPage = await getTrelloBoardPage(this);
    await boardPage.assertBoardDeleted(this.boardId);
});