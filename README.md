# Athena Plugin - Email Auth

A simple non-discord login single sign on service compatible with `4.0.0` of the [Athena Framework](https://athenaframework.com/).

* Email based accounts.
* Code utilized to sign into an account.
* Works in production mode only.
* Automatic dev mode support.

## Installation

0. Add a `disable` file to the `src/coreplugins/core-discord-login` plugin to disable it.
1. Open a command prompt in your main Athena Directory.
2. Navigate to the plugins folder.

```ts
cd src/core/plugins
```

3. Copy the command below.

**SSH**

```
git clone git@github.com:Athena-Roleplay-Framework/athena-plugin-email-auth.git
```

**HTTPS**
```
git clone https://github.com/Athena-Roleplay-Framework/athena-plugin-email-auth
```

4. `npm install nodemailer`
5. Setup SendGrid or any supported NodeMailer Service
   
    a. You need a domain (.com, .org, whatever) registered under you.

    b. Utilize https://sendgrid.com/

    c. Setup Sender Authentication https://app.sendgrid.com/settings/sender_auth

    d. Go through the steps to verify your domain with sendgrid.

    e. Create an API key https://app.sendgrid.com/settings/api_keys

    f. In `server/src/config.ts` fill in the information.

    g. Set the username to `noreply@yourwebsite.com`

    h. Only fill in password with API key.

6. Start the server in windows or linux mode.
7. Enter an email, enter a code, and you will be sent down a registration or login path based on existing accounts.