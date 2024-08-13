# Anonymous Account for Auth0
Anonymous user account logic for Auth0

## How Does it Work?

This solution sits as a proxy in front of Auth0's `POST /dbconnection/signup` endpoint. When a sign-up request arrives,
if it's intended for anonymous database connection, it attaches send an anonymous user_id in a signed JWT inside
password field.

Custom DB validates this password and creates the user with requested user_id.

User ID generation is proxy can follow any custom logic, such as based on device attestation, a fingerprint cookie or
similar.

## Todo

1. Upgrade to itty-router v5