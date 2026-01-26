import { Given, When, Then } from '@cucumber/cucumber';
import 'dotenv/config';
import { TrelloCardPage } from '../support/pages/cardPage';

let trelloCardPage: TrelloCardPage | undefined;

async function getTrelloCardPage(): Promise<TrelloCardPage> {
    if (!trelloCardPage) {
        trelloCardPage = await TrelloCardPage.create();
    }
    return trelloCardPage;
}

When('I send a request to create a card', async function () {
    const cardPage = await getTrelloCardPage();
    this.response = await cardPage.createCard(this.listId);

});

Then('the response should contain a valid card ID', async function () {
    const cardPage = await getTrelloCardPage();
    const cardId = await cardPage.extractCardId(this.response);
    this.cardId = cardId;
});

Given('I have a valid card ID', async function () {
    const cardPage = await getTrelloCardPage();
    cardPage.ensureValidCardId(this.cardId);
});

When('I send a request to retrieve the card details', async function () {
    const cardPage = await getTrelloCardPage();
    this.response = await cardPage.getCard(this.cardId);
});

Then('the response should contain the correct card information', async function () {
    const cardPage = await getTrelloCardPage();
    await cardPage.assertCardId(this.response, this.cardId);
});

When('I send a request to update the card\'s name', async function () {
    const cardPage = await getTrelloCardPage();
    const newCardName = "Updated Card Name";
    this.response = await cardPage.updateCardName(this.cardId, newCardName, this.listId, "Updated description");
});


Then('the response should reflect the updated card name', async function () {
    const cardPage = await getTrelloCardPage();
    await cardPage.assertCardName(this.response, "Updated Card Name");
});

When('I send a request to delete the card', async function () {
    const cardPage = await getTrelloCardPage();
    this.response = await cardPage.deleteCard(this.cardId);
});

Then('the card should no longer exist when I attempt to retrieve it', async function () {
    const cardPage = await getTrelloCardPage();
    await cardPage.assertCardDeleted(this.cardId);
});