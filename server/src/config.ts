export const CONFIG = {
    MAIL_SERVICE: {
        // Should be an authenticated email from SendGrid. You need a website.
        FROM: 'noreply@yourwebsite.com',
        // SendGrid Example
        USER: 'apikey', // Leave this alone if using SendGrid
        // SendGrid API Key
        // https://app.sendgrid.com/settings/api_keys
        PASSWORD: 'API_KEY_GOES_HERE',
        HOST: 'smtp.sendgrid.net',
        PORT: 587,
    },
};
