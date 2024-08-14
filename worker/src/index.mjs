/** uncomment me for first deployment from terraform
 export default {
 async fetch(request, env, ctx) {
 const body = `hello world`;
 return new Response(body, {headers: {'Content-Type': 'text/html'}});
 }
 }
 */

import {Router} from 'itty-router';
import {SignJWT} from 'jose';

const encoder = new TextEncoder();

const router = Router();

router.get('/index.html', async (request, env) => {
        const body = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Index</title>
</head>
<body>
            Welcome: ${env.AUTH0_EDGE_LOCATION}
</body>
            </html>`;
        return new Response(body, {headers: {'Content-Type': 'text/html'}});
    }
);

async function forward(request, env) {
    console.log(request.url);
    console.log(env.AUTH0_EDGE_LOCATION);

    const url = new URL(request.url);
    url.hostname = env.AUTH0_EDGE_LOCATION;

    const newRequest = new Request(url, request, {headers: new Headers(request.headers)});
    newRequest.headers.set("Host", env.AUTH0_EDGE_LOCATION);
    //newRequest.headers.set("cname-api-key", env.CNAME_API_KEY);

    return await fetch(newRequest);
}

async function signJWT(payload, secret, expiresIn) {
    return await new SignJWT(payload)
        .setProtectedHeader({alg: 'HS256'})
        .setExpirationTime(expiresIn)
        .sign(encoder.encode(secret));
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

router.post('/oauth/token', async (request, env) => {
    try {
        console.log("In /oauth/token");

        // TODO: handle form-post ?
        // Read the request body once and store it
        const originalBody = await request.clone().json();
        console.log(originalBody);

        const {grant_type, realm, username} = originalBody;

        if(grant_type !== "http://auth0.com/oauth/grant-type/password-realm") {
            return fetch(request, env);
        }

        if (realm !== env.TARGET_CONNECTION) {
            return forward(request, env);
        }

        console.log(`this is an ROPG against: ${env.TARGET_CONNECTION} for username: ${username}`);

        originalBody.password = await signJWT({user_id: username}, env.SHARED_SECRET, '180s');

        const body = JSON.stringify(originalBody);

        // Proxy the request to Auth0
        const url = new URL(request.url);
        const proxiedRequest = new Request(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body
        });

        const contentLength = new TextEncoder().encode(body).length;
        proxiedRequest.headers.set("Content-Length", contentLength);

        return forward(proxiedRequest, env);

    } catch (e) {
        console.error('Error in custom token:', e);
        return new Response('Internal Server Error', {status: 500});
    }
})

router.post('/dbconnections/signup', async (request, env) => {
    try {
        console.log("In /dbconnections/signup");

        // TODO: handle form-post ?
        // Read the request body once and store it
        const originalBody = await request.clone().json();
        console.log(originalBody);

        if (originalBody.connection !== env.TARGET_CONNECTION) {
            return forward(request, env);
        }

        console.log(`this is a signup against: ${env.TARGET_CONNECTION} for email: ${originalBody.email}`);

        const user_id = generateUUID();

        originalBody.password = await signJWT({user_id}, env.SHARED_SECRET, '180s');
        originalBody.email = `${user_id}@anonymous.email`;

        const body = JSON.stringify(originalBody);

        // Proxy the request to Auth0
        const url = new URL(request.url);
        const proxiedRequest = new Request(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body
        });

        const contentLength = new TextEncoder().encode(body).length;
        proxiedRequest.headers.set("Content-Length", contentLength);

        return forward(proxiedRequest, env);
    } catch (e) {
        console.error('Error in custom sign up:', e);
        return new Response('Internal Server Error', {status: 500});
    }
})

router.all('*', async (request, env) => {
    return forward(request, env);
});

export default {
    async fetch(request, env, ctx) {
        return router.handle(request, env);
    }
};


