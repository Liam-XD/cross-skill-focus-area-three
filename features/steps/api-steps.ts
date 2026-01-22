import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { APIRequestContext, request } from '@playwright/test';

setDefaultTimeout(60 * 1000);

let apiRequestContext: APIRequestContext;
let response: any;
let requestBody: Record<string, any> = {};

When('I send a GET request to {string}', async function (url: string) {
    apiRequestContext = await request.newContext();
    response = await apiRequestContext.get(url);
});


When('I send a POST request to {string} with body:', async function (url: string, dataTable) {
    apiRequestContext = await request.newContext();
    // Convert Cucumber dataTable to object
    const rows = dataTable.raw();
    requestBody = {};
    for (const [key, value] of rows) {
        requestBody[key] = isNaN(Number(value)) ? value : Number(value);
    }
    response = await apiRequestContext.post(url, { data: requestBody });
});

Then('the response status should be {int}', async function (status: number) {
    expect(response.status()).toBe(status);
});


Then('the response should have a property {string} with value {string}', async function (property: string, value: string) {
    const json = await response.json();
    expect(json[property]).toEqual(isNaN(Number(value)) ? value : Number(value));
});

Then('the response should have a property {string} with value {int}', async function (property: string, value: number) {
    const json = await response.json();
    expect(json[property]).toEqual(value);
});
