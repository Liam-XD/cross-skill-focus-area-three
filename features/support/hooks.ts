import { AfterAll, Before } from '@cucumber/cucumber';
import 'dotenv/config';
import { createBoard, deleteAllBoards } from './trelloClient';

Before({ tags: '@board' }, async function () {
    // Create a Trello board before tagged scenarios using the Trello client helper
    const { boardId, boardName } = await createBoard();

    // Expose values via the Cucumber World
    this.boardId = boardId;
    this.boardName = boardName;
});

AfterAll(async function () {
    // Clean up created boards after all tests have run using the Trello client helper
    await deleteAllBoards();
});