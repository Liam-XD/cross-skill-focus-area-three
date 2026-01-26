import { Given, When, Then } from '@cucumber/cucumber';
import 'dotenv/config';

When('I send a request to create a card', async function () {
    const cardName = 'Card_' + Math.random().toString(36).substring(2, 8);
    const params = {
        idList: this.listId,
        name: cardName,
        key: process.env.TRELLO_API_KEY!,
        token: process.env.TRELLO_API_TOKEN!,
    };

    const postUrl = `cards`;
    this.response = await this.apiRequestContext.post(postUrl, {
        form: params,
    });

});

Then('the response should contain a valid card ID', async function () {
    const jsonData = await this.response.json();
    if (!jsonData.id) {
        throw new Error('Response from card creation does not contain id');
    }

    this.cardId = jsonData.id;
});

Given('I have a valid card ID', async function () {
    if (!this.cardId) {
        throw new Error('Card ID is not available on the World. Ensure the @card hook has run and created a card.');
    }
});

When('I send a request to retrieve the card details', async function () {
    const getUrl = `cards/${this.cardId}?key=${process.env.TRELLO_API_KEY!}&token=${process.env.TRELLO_API_TOKEN!}`;
    this.response = await this.apiRequestContext.get(getUrl);
});

Then('the response should contain the correct card information', async function () {
    const jsonData = await this.response.json();
    if (jsonData.id !== this.cardId) {
        throw new Error(`Expected card ID ${this.cardId} but got ${jsonData.id}`);
    }
});

When('I send a request to update the card\'s name', async function () {
    const newCardName = "Updated Card Name";
    const params = {
        key: process.env.TRELLO_API_KEY!,
        token: process.env.TRELLO_API_TOKEN!,
    };

    const putUrl = `cards/${this.cardId}?${new URLSearchParams(params).toString()}`;
    this.response = await this.apiRequestContext.put(putUrl, {
        form: {
            idList: this.listId,
            name: newCardName,
            desc: "Updated description"

        },
    });
});

Then('the response should reflect the updated card name', async function () {
    const jsonData = await this.response.json();
    if (jsonData.name !== "Updated Card Name") {
        throw new Error(`Expected card name "Updated Card Name" but got ${jsonData.name}`);
    }
});

When('I send a request to delete the card', async function () {
    const deleteUrl = `cards/${this.cardId}?key=${process.env.TRELLO_API_KEY!}&token=${process.env.TRELLO_API_TOKEN!}`;
    this.response = await this.apiRequestContext.delete(deleteUrl);
});

Then('the card should no longer exist when I attempt to retrieve it', async function () {
    const getUrl = `cards/${this.cardId}?key=${process.env.TRELLO_API_KEY!}&token=${process.env.TRELLO_API_TOKEN!}`;
    const getResponse = await this.apiRequestContext.get(getUrl);
    if (getResponse.status() !== 404) {
        throw new Error(`Expected 404 status for deleted card but got ${getResponse.status()}`);
    }
}); 