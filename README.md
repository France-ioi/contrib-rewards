## Technologies

- Next.js (React)
- Prisma + MySQL
- Tailwind CSS

## Getting Started

First, install the dependencies:

```
yarn
```

Next, copy `.env` to an `.env.local` file and edit this local file
with your environment variables.

Use this command to generate the secrets.

```
yarn generate-secrets
```

Copy them into `.env.local`

Finally, run the development server:

```
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Login Module configuration

Here are the fields to specify in the login module configuration for this client:

```
redirect: http://localhost:3000/api/auth/callback/france-ioi
user_attributes: ["login","primary_email","first_name","last_name"]
verifiable_attributes: ["primary_email"]
recommended_attributes: ["picture"]
```

Don't forget to add in `oauth_client_verification_method` the verification
method corresponding to the `email_code` (cf table `verification_methods`).
