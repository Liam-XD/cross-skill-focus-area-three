import { test, expect, request } from '@playwright/test';

test('GET request to example API', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id', 1);
});

test('POST request to example API', async ({ request }) => {
    const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
        data: {
            title: 'foo',
            body: 'bar',
            userId: 1
        }
    });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('title', 'foo');
});
