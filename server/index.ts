import { PluginSystem } from '@AthenaServer/systems/plugins';
import { MailService } from './src/email';
import { LoginSystem } from './src/login';

const PLUGIN_NAME = 'Email Auth';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    MailService.init();
    LoginSystem.init();
});
