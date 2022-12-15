const { ValidationError } = require("./model");

const isTestMode = TEST_MODE === "true"

function isAlphaNumeric(str) {
    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
};
function formatPostUrl(productData, postId) {
    return productData.base_url + '/api/v2/community/posts/' + postId;
}
async function fetchPostData(postUrl) {
    if (isTestMode) {
        return {
            "post": {
                html_url: "http://html.url",
                title: "This is the title of the post",
                follower_count: 10,
                vote_sum: 6,
                comment_count: 15,
                status: "planned"
            }
        }
    }

    // check cache
    const cacheKey = "_cache_" + postUrl
    cachedData = await db.getData(cacheKey);
    if (cachedData != null) {
        let expiryDate = new Date(cachedData.ts + 2 * 60 * 1000); // 2 minute cache
        let currentDate = new Date(Date.now())
        if (expiryDate > currentDate) {
            return cachedData.body
        }
    }
    const postData = await fetch(postUrl, { headers: { 'Accept': 'application/json' } }).then(response => {
        if (response.ok) {
            return response.json()
        } else {
            return {}
        }
    });
    if (postData.post === undefined) {
        return null;
    }
    await db.saveData(cacheKey, {
        "ts": new Date(Date.now()).getTime(),
        "body": postData
    });
    return postData;
}
async function validatePostId(productData, postId) {
    if (!isAlphaNumeric(postId)) {
        throw new ValidationError(400, "Post ID is not alphanumeric", null)
    }
    const postUrl = formatPostUrl(productData, postId);
    const postData = await fetchPostData(postUrl);
    if (postData == null) {
        throw new ValidationError(400, "Post does not exist", null)
    }
}

module.exports = { validatePostId, fetchPostData, formatPostUrl };