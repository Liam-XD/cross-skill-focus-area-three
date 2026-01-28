/** 
 *  TestWorld is a class that sets up a contract between hooks and step definitions in Cucumber tests.
 *  It becomes a global scenario context for all steps
 *  It allows shared state in one place and creates page objects only when needed.
 *  This allowing for better consistency and efficiency in running each scenario.
 * */

import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { APIRequestContext, APIResponse } from '@playwright/test';
import { TrelloBoardPage } from './pages/boardPage';
import { TrelloCardPage } from './pages/cardPage';

export class TestWorld extends World {
    apiRequestContext?: APIRequestContext;
    private _boardPage?: TrelloBoardPage;
    private _cardPage?: TrelloCardPage;
    boardId?: string;
    boardName?: string;
    listId?: string;
    cardId?: string;
    response?: APIResponse;

    constructor(options: IWorldOptions) {
        super(options);
    }

    get boardPage(): TrelloBoardPage {
        if (!this.apiRequestContext) {
            throw new Error('APIRequestContext is not initialized');
        }
        if (!this._boardPage) {
            this._boardPage = TrelloBoardPage.fromContext(this.apiRequestContext);
        }
        return this._boardPage;
    }

    get cardPage(): TrelloCardPage {
        if (!this.apiRequestContext) {
            throw new Error('APIRequestContext is not initialized');
        }
        if (!this._cardPage) {
            this._cardPage = TrelloCardPage.fromContext(this.apiRequestContext);
        }
        return this._cardPage;
    }

    resetPages(): void {
        this._boardPage = undefined;
        this._cardPage = undefined;
    }
}

setWorldConstructor(TestWorld);
