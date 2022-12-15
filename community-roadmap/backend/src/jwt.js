
// JWT/permission related functions

const { ValidationError } = require("./model");

const isTestMode = TEST_MODE === "true"
const TEST_TOKEN = "df543fis5l.54fs53jkdnlkweorr543.ikvjsdnl534kadlsa"

/**
* Parse the JWT and validate it.
*
* We are just checking that the JWT is not expired and that the signature is valid,
* but you can do more that. You could have e.g. implement permissions based on
* the user and the request.
*/
async function validateJwt(productData, token, writeOperation) {
    // Is the token expired?
    let expiryDate = new Date(token.payload.exp * 1000)
    let currentDate = new Date(Date.now())
    if (expiryDate <= currentDate) {
        throw new ValidationError(401, "JWT is expired", null);
    }
    if (productData != null) {
        if (!isValidJwtSignature(token, productData.jwk)) {
            throw new ValidationError(401, "Invalid JWT signature", null);
        }
        if (token.payload.origin != productData.base_url && !isTestMode) {
            throw new ValidationError(401, "JWT origin '" + token.payload.origin + "' is not allowed", null);
        }
        if (writeOperation && productData.owners.indexOf(token.payload.userId.toString()) == -1) {
            throw new ValidationError(401, "Unauthorized user ID '" + token.payload.userId + "' not a member of owners", productData.owners);
        }
    }
    return null;
}

/**
* For this example, the JWT is passed in as part of the Authorization header,
* after the Bearer scheme.
* Parse the JWT out of the header and return it.
*/
function getJwtToken(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return null;
    }
    if (authHeader.substring(0, 6) !== 'Bearer') {
        return null
    }
    return authHeader.substring(6).trim()
}

/**
* Parse and decode a JWT.
* A JWT is three, base64 encoded, strings concatenated with ‘.’:
*   a header, a payload, and the signature.
* The signature is “URL safe”, in that ‘/+’ characters have been replaced by ‘_-’
* 
* Steps:
* 1. Split the token at the ‘.’ character
* 2. Base64 decode the individual parts
* 3. Retain the raw Bas64 encoded strings to verify the signature
*/
function decodeJwt(token) {
    if (token == null) {
        return null;
    }
    const parts = token.split('.');
    if (isTestMode && token == TEST_TOKEN) {
        return {
            header: {},
            payload: {
                "userId": 377841432074,
                "email": "test@test.com",
                "origin": "http://localhost:3000",
            },
            signature: {},
            raw: { header: parts[0], payload: parts[1], signature: parts[2] }
        }
    }
    try {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        const signature = atob(parts[2].replace(/_/g, '/').replace(/-/g, '+'));
        return {
            header: header,
            payload: payload,
            signature: signature,
            raw: { header: parts[0], payload: parts[1], signature: parts[2] }
        }
    } catch (e) {
        throw new ValidationError(401, "Invalid token format", null);
    }
}

/**
* Validate the JWT.
*
* Steps:
* Reconstruct the signed message from the Base64 encoded strings.
* Load the RSA public key into the crypto library.
* Verify the signature with the message and the key.
*/
async function isValidJwtSignature(token, jwk) {
    if (jwk['kty'] !== "RSA") {
        return false;
    }
    if (isTestMode) {
        return token === [token.raw.header, token.raw.payload, token.raw.signature].join('.');
    }
    const encoder = new TextEncoder();
    const data = encoder.encode([token.raw.header, token.raw.payload].join('.'));
    const signature = new Uint8Array(Array.from(token.signature).map(c => c.charCodeAt(0)));
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    return crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data)
}

function getTestToken() {
    if (TEST_MODE) {
        return TEST_TOKEN
    }
    return "";
}

module.exports = { validateJwt, decodeJwt, getJwtToken, getTestToken };