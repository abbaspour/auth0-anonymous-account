async function login(email, password, callback) {
    console.log(`anon-db login for: ${email}`);

    const {jwtVerify} = require('jose');
    const encoder = new TextEncoder();
    const {SHARED_SECRET} = configuration;

    try {
        const {payload} = await jwtVerify(password, encoder.encode(SHARED_SECRET));
        const {user_id} = payload;
        console.log(`anon-db login payload is valid. email ${email} => ${user_id}`);

        const profile = {
            email,
            user_id: user_id,
            email_verified: false,
        };
        return callback(null, profile);
    } catch (error) {
        return callback(error);
    }
}