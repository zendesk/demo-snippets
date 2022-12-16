const { ValidationError } = require("./model");

dbmodule = require("./db")
db = new dbmodule.RoadmapDb(KVDATA);
model = require("./model")
community = require("./community_api")

async function getRoadmapData() {
    var roadmaps = await db.getData("_roadmaps");
    var roadmapsOutput = new Array()
    if (roadmaps != null) {
        for (let i = 0; i < roadmaps.products.length; i++) {
            const productKey = roadmaps.products[i];
            const productData = await getProductData(productKey);
            roadmapsOutput.push(actions.formatProductData(productKey, productData));
        }
    }
    return {
        "products": roadmapsOutput
    }
}

async function createProduct(productKey, productName, baseUrl, ownerId) {
    await db.getData(productKey).then(data => {
        if (data != null) {
            throw new ValidationError(400, "Product already exists", data);
        }
    });
    const productData = {
        "name": productName,
        "base_url": baseUrl,
        "product_areas": [],
        "owners": [
            ownerId.toString()
        ],
        "jwk": {
            "kty": "RSA",
            "n": "yaiTIWA7vCbzoEEBAyV_dMd2Ao-IP8tSNSVxgZLyLiVorWtSdH7Vcp4qbTwiTWimDbjWZEZFUcbNDg_wLjv3efLcjE1eVrF_ewQOoR3C-dskNE_QyxC-aVvKDCGj-kMXnuHGvvZZmvt0CBeNZUSSbhGnqVta46O5hijoYCpNJOxwj8Ml84CnpBhgMllcyFUT7_Mx_I-w6_8CkSS-5XZMJXqaDZ3xljXMoIW5jTMfLU5_1X8sgv_Pn45yzACJHsyPIx0moEoL2lasI-jLPJt8G3aj8pcjwLTTa5cIT4s0tlZlMC2m4Kz0ictVqyMvCaJTxf6YIFa63KN7IiHJqu_ULmWxtIFb90X6hurNvyUqTfBbY-gKYX-i8TjG2x96Zec7-5PQ6OCzuz6fu7Xq56B_IVCkkQKTWAVHGapP1wZXWRLZB7AyZMhQ3ug5-ISIC4ySE8bIhuo82HDZy-m2dSnG4BU9sHFPlCRAyp5UzNDJofrc_aGW_3nRgPJ0eiC12ig_",
            "e": "AQAB",
            "kid": "deeee01d5023d9b44c5b5ab2583be9354620249652a48568ed2cb5bff8d86841"
        }
    };
    await saveProductData(productKey, productData);

    var roadmaps = await db.getData("_roadmaps");
    if (roadmaps == null) {
        roadmaps = { "products": [] };
    }
    roadmaps.products.push(productKey);
    return db.saveData("_roadmaps", roadmaps);
}
async function setProductOwners(productKey, productData, newOwners, currentUserId) {
    currentUserId = currentUserId.toString();
    if (newOwners.indexOf(currentUserId) == -1) {
        // cannot remove the current user ID from the owner list
        newOwners.push(currentUserId);
    }
    productData.owners = newOwners;
    return saveProductData(productKey, productData).then(() => {
        return productData.owners;
    });
}
async function createProductArea(productKey, productAreaKey, productAreaName) {
    const productData = await getProductData(productKey);
    productData.product_areas.push({
        "key": productAreaKey,
        "name": productAreaName
    });
    await saveProductAreaData(productKey, productAreaKey, { "items": [] });
    return saveProductData(productKey, productData);
}
async function getProductData(productKey) {
    return db.getData(productKey).then(data => {
        if (data == null) {
            throw new ValidationError(404, "Product not found", "Key: " + productKey);
        }
        return data;
    });
}
async function deleteProduct(productKey) {
    var roadmaps = await db.getData("_roadmaps");
    if (roadmaps == null) {
        roadmaps = { "products": [] };
    }
    const productIndex = roadmaps.products.indexOf(productKey);
    if (productIndex != -1) {
        roadmaps.products.splice(productIndex, 1);
        await db.saveData("_roadmaps", roadmaps);
    }
    return db.deleteDataWithPrefix(productKey);
}
async function saveProductData(productKey, productData) {
    return db.saveData(productKey, productData);
}
function formatProductData(productKey, productData) {
    return {
        "key": productKey,
        "href": "/products/" + productKey,
        "name": productData.name,
        "base_url": productData.base_url,
        "product_areas": productData.product_areas.map(productArea => {
            return {
                "key": productArea.key,
                "name": productArea.name,
                "href": "/products/" + productKey + "/areas/" + productArea.key
            }
        }),
        "owners": productData.owners
    };
}
async function getProductAreaData(productKey, productAreaKey) {
    return db.getData(productKey + "/" + productAreaKey);
}
async function saveProductAreaData(productKey, productAreaKey, productAreaData) {
    return db.saveData(productKey + "/" + productAreaKey, productAreaData);
}
async function formatProductAreaData(productKey, productData, productAreaKey, productAreaData) {
    const items = productAreaData.items;
    for (var i = 0; i < items.length; i++) {
        const postId = items[i].post_id;
        items[i]['href'] = "/products/" + productKey + "/areas/" + productAreaKey + "/items/" + postId;
        const postUrl = community.formatPostUrl(productData, postId);
        items[i]['post_api_url'] = postUrl;
        const postData = await community.fetchPostData(postUrl);
        if (postData !== null) {
            items[i]['post_html_url'] = postData.post.html_url;
            items[i]['post_title'] = postData.post.title;
            items[i]['post_follower_count'] = postData.post.follower_count;
            items[i]['post_vote_sum'] = postData.post.vote_sum;
            items[i]['post_comment_count'] = postData.post.comment_count;
            items[i]['post_status'] = postData.post.status;
        }
    }
    return productAreaData;
}
async function addProductAreaItem(productKey, productData, productAreaKey, productAreaData, name, postId, imgUrl) {
    await community.validatePostId(productData, postId);
    // Add to productAreaData
    productAreaData.items.push({
        "name": name,
        "post_id": postId,
        "img_url": imgUrl
    });
    await saveProductAreaData(productKey, productAreaKey, productAreaData);
}
async function updateProductAreaItem(productKey, productData, productAreaKey, productAreaData, postId, name, imgUrl) {
    if (postId !== undefined) {
        const validationErrorMessage = await community.validatePostId(productData, postId);
    }
    const itemIndex = productAreaData.items.findIndex(itemData => itemData.post_id == postId)
    if (itemIndex == -1) {
        throw new ValidationError(404, "Item not found", postId);
    }
    if (name !== undefined) {
        productAreaData.items[itemIndex].name = name;
    }
    if (imgUrl !== undefined) {
        productAreaData.items[itemIndex].img_url = imgUrl
    }
    await saveProductAreaData(productKey, productAreaKey, productAreaData);
}
async function deleteProductAreaItemByPostId(productKey, productAreaKey, productAreaData, postId) {
    const itemIndex = productAreaData.items.findIndex(itemData => itemData.post_id == postId)
    if (itemIndex == -1) {
        throw new ValidationError(404, "Item not found", postId);
    }
    // Remove from productAreaData
    productAreaData.items.splice(itemIndex, 1);
    await saveProductAreaData(productKey, productAreaKey, productAreaData);
}
async function deleteProductArea(productKey, productAreaKey) {
    const productData = await getProductData(productKey);
    const areaIndex = productData.product_areas.findIndex(area => area.key == productAreaKey)
    if (areaIndex == -1) {
        throw new ValidationError(404, "Product area not found", productAreaKey);
    }
    productData.product_areas.splice(areaIndex, 1);
    await saveProductData(productKey, productData);
    return db.deleteDataWithPrefix(productKey + "/" + productAreaKey);
}

module.exports = { getRoadmapData, createProduct, setProductOwners, createProductArea, getProductAreaData, getProductData, formatProductAreaData, formatProductData, addProductAreaItem, updateProductAreaItem, deleteProductAreaItemByPostId, deleteProductArea, deleteProduct };