import { Given, When, Then } from '@cucumber/cucumber';
import 'dotenv/config';
import { TrelloBoardPage } from '../support/pages/boardPage';


let trelloBoardPage: TrelloBoardPage | undefined;

async function getTrelloBoardPage(): Promise<TrelloBoardPage> {
    if (!trelloBoardPage) {
        trelloBoardPage = await TrelloBoardPage.create();
    }
    return trelloBoardPage;
}

Given('I am authenticated with the Trello API', async function () {
    this.trelloBoardPage = await TrelloBoardPage.create();
});

When('I send a request to create a board', async function () {
    const boardPage = await getTrelloBoardPage();
    this.response = await boardPage.createBoard();
});

Then('the API should return a success status', async function () {
    const boardPage = await getTrelloBoardPage();
    if (!this.response) {
        throw new Error('Response is not available on the World. Ensure a request step has run before this assertion.');
    }
    boardPage.assertSuccess(this.response, 200);
});

Then('the response should contain a valid board ID', async function () {
    const boardPage = await getTrelloBoardPage();
    this.boardId = await boardPage.extractBoardId(this.response);
});

Given('I have a valid board ID', async function () {
    if (!this.boardId) {
        throw new Error('Board ID is not available on the World. Ensure the @board hook has run and created a board.');
    }
});

When('I send a request to update the board\'s name', async function () {
    const newBoardName = "Updated Board Name";
    const boardPage = await getTrelloBoardPage();
    this.response = await boardPage.updateBoardName(this.boardId, newBoardName);
});

When('I send a request to retrieve the board details', async function () {
    const boardPage = await getTrelloBoardPage();
    this.response = await boardPage.getBoard(this.boardId);
});

Then('the response should contain the correct board information', async function () {
    const boardPage = await getTrelloBoardPage();
    await boardPage.assertBoardName(this.response, this.boardName);
});

Then('the response should reflect the updated board name', async function () {
    const boardPage = await getTrelloBoardPage();
    await boardPage.assertBoardName(this.response, "Updated Board Name");
});

When('I send a request to delete the board', async function () {
    const boardPage = await getTrelloBoardPage();
    this.response = await boardPage.deleteBoard(this.boardId);
});

Then('the board should no longer exist when I attempt to retrieve it', async function () {
    const boardPage = await getTrelloBoardPage();
    await boardPage.assertBoardDeleted(this.boardId);
});