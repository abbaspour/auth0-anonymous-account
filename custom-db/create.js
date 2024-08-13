async function create(user, callback) {
    const {password, email} = user;

    console.log(`anon-db create for: ${email}`);

    const {jwtVerify} = require('jose');
    const encoder = new TextEncoder();
    const {SHARED_SECRET} = configuration;

    console.log(`validating HS256 JWT: ${password}`);

    try {
        const {payload} = await jwtVerify(password, encoder.encode(SHARED_SECRET));
        const {user_id} = payload;
        console.log(`anon-db create payload is valid. ${email} => ${user_id}`);
        return callback(null);
    } catch (error) {
        return callback(error);
    }
}