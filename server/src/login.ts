import * as alt from 'alt-server';
import { Athena } from '@AthenaServer/api/athena';
import { DevModeOverride } from '@AthenaServer/systems/dev';
import { Account } from '@AthenaServer/interface/iAccount';
import { AccountSystem } from '@AthenaServer/systems/account';
import { AgendaOrder } from '@AthenaServer/systems/agenda';
import { LOGIN_EVENTS } from '@AthenaPlugins/athena-plugin-email-auth/shared/events';
import { sha256Random } from '@AthenaServer/utility/encryption';
import { LOGIN_LOCALES } from '@AthenaPlugins/athena-plugin-email-auth/shared/locales';
import { MailService } from './email';

const EmailRegex = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
);

const LoginTokens: Map<number, { email: string; code: string }> = new Map();
const LoginAttempts: Map<number, number> = new Map();

const InternalFunctions = {
    removeToken(player: alt.Player) {
        const id = player.id ? player.id : -1;
        if (id <= -1) {
            return;
        }

        if (LoginTokens.has(id)) {
            LoginTokens.delete(id);
        }

        if (LoginAttempts.has(id)) {
            LoginAttempts.delete(id);
        }
    },
    async developerModeCallback(player: alt.Player) {
        const accounts = await Athena.database.funcs.fetchAllData<Account>(Athena.database.collections.Accounts);
        if (!accounts || typeof accounts[0] === 'undefined') {
            alt.logWarning(`Missing First Account...`);
            alt.logWarning(`Run the server at least once with 'npm run windows' before running dev mode.`);
            process.exit(1);
        }

        const account = accounts[0];
        await Athena.player.set.account(player, account);
    },
    async tryLogin(player: alt.Player, code: string): Promise<void> {
        const token = LoginTokens.get(player.id);
        if (typeof token === 'undefined' || !token.email || !token.code) {
            InternalFunctions.show(player);
            return undefined;
        }

        code = code.toUpperCase();
        if (code !== token.code) {
            let attempts = LoginAttempts.has(player.id) ? LoginAttempts.get(player.id) : 0;
            attempts += 1;
            if (attempts >= 3) {
                player.kick(LOGIN_LOCALES.LOGIN_ATTEMPTS_EXCEEDED);
                return;
            }

            LoginAttempts.set(player.id, attempts);
            alt.emitClient(player, LOGIN_EVENTS.TO_CLIENT.PROMPT_FOR_CODE);
            return;
        }

        // Account Fetch
        let account = await Athena.database.funcs.fetchData<Account>(
            'email',
            token.email,
            Athena.database.collections.Accounts,
        );

        // Account Creation
        if (typeof account === 'undefined' || account === null) {
            account = await AccountSystem.create(player, { email: token.email });
        }

        if (account.banned) {
            player.kick(account.reason);
            return;
        }

        InternalFunctions.removeToken(player);
        await Athena.player.set.account(player, account);
        Athena.systems.agenda.goNext(player);
    },
    async sendCode(player: alt.Player, email: string) {
        if (!EmailRegex.test(email)) {
            InternalFunctions.show(player);
            return;
        }

        const code = sha256Random(email).slice(0, 8).toUpperCase();
        LoginTokens.set(player.id, { email, code });
        await MailService.send(email, LOGIN_LOCALES.EMAIL_SUBJECT, `${LOGIN_LOCALES.EMAIL_YOUR_LOGIN_CODE}${code}`);
        alt.emitClient(player, LOGIN_EVENTS.TO_CLIENT.PROMPT_FOR_CODE);
    },
    show(player: alt.Player) {
        LoginTokens.set(player.id, undefined);
        alt.emitClient(player, LOGIN_EVENTS.TO_CLIENT.PROMPT_FOR_EMAIL);
    },
};

export const LoginSystem = {
    init() {
        alt.on('playerDisconnect', InternalFunctions.removeToken);
        alt.onClient(LOGIN_EVENTS.TO_SERVER.GIVE_CODE, InternalFunctions.tryLogin);
        alt.onClient(LOGIN_EVENTS.TO_SERVER.GIVE_EMAIL, InternalFunctions.sendCode);
        Athena.systems.agenda.set(AgendaOrder.LOGIN_SYSTEM, InternalFunctions.show);
        DevModeOverride.setDevAccountCallback(InternalFunctions.developerModeCallback);
    },
};
