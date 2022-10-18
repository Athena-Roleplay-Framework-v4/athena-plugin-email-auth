import { AthenaClient } from '@AthenaClient/api/athena';
import * as alt from 'alt-client';
import { LOGIN_EVENTS } from '../shared/events';
import { LOGIN_LOCALES } from '../shared/locales';
import * as native from 'natives';

const InternalFunctions = {
    init() {
        alt.onServer(LOGIN_EVENTS.TO_CLIENT.PROMPT_FOR_EMAIL, InternalFunctions.promptEmail);
        alt.onServer(LOGIN_EVENTS.TO_CLIENT.PROMPT_FOR_CODE, InternalFunctions.promptCode);
    },
    async promptEmail() {
        native.doScreenFadeOut(0);
        const response = await AthenaClient.rmlui.inputBox.create(
            {
                placeholder: LOGIN_LOCALES.ENTER_VALID_EMAIL,
                hideHud: true,
                blur: true,
                darken: true,
            },
            true,
        );

        if (!response || !response.includes('@')) {
            InternalFunctions.promptEmail();
            return;
        }

        alt.emitServer(LOGIN_EVENTS.TO_SERVER.GIVE_EMAIL, response);
    },
    async promptCode() {
        native.doScreenFadeOut(0);
        const response = await AthenaClient.rmlui.inputBox.create(
            {
                placeholder: LOGIN_LOCALES.ENTER_CODE,
                hideHud: true,
                blur: true,
                darken: true,
            },
            true,
        );

        if (!response) {
            InternalFunctions.promptEmail();
            return;
        }

        alt.emitServer(LOGIN_EVENTS.TO_SERVER.GIVE_CODE, response);
        native.doScreenFadeIn(100);
    },
};

InternalFunctions.init();
