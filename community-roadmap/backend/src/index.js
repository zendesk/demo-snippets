const { ValidationError } = require("./model");

jwt = require("./jwt")
actions = require("./actions")

addEventListener("fetch", event => {
  event.respondWith(handleRequestAndErrors(event.request));
})

async function handleRequestAndErrors(request) {
  const responseHeaders = new Headers();
  // Allow CORS
  responseHeaders.set('Access-Control-Allow-Origin', '*')
  responseHeaders.set('Access-Control-Allow-Headers', '*')
  responseHeaders.set('Access-Control-Allow-Methods', '*')

  try {
    return await handleRequest(request, responseHeaders)
  } catch (e) {
    if (e instanceof ValidationError) {
      return response(e.status, responseHeaders, {
        "message": e.message,
        "detail": e.detail
      });
    }
    throw e;
  }
}

async function handleRequest(request, responseHeaders) {
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;
  const pathParts = path.substring(1).split('/');
  const endpoint = method + " " + path;

  if (method == "GET" || method == "POST" || method == "PUT" || method == "DELETE") {
    responseHeaders.set("Content-Type", "application/json");
  }

  const isTestMode = TEST_MODE === "true"
  const encodedToken = jwt.getJwtToken(request);
  const decodedToken = jwt.decodeJwt(encodedToken);
  const currentUserId = decodedToken?.payload?.userId;

  if (endpoint == "GET /hc/api/v2/integration/token") {
    if (isTestMode) {
      // get token endpoint
      return response(200, responseHeaders, { "token": jwt.getTestToken() })
    } else {
      return response(404, responseHeaders, { "error": "This is a test-environment endpoint only" });
    }
  }

  // Read root
  if (endpoint == "GET /") {
    var roadmap = await actions.getRoadmapData();
    return response(200, responseHeaders, roadmap);
  }

  if (endpoint == "POST /products") {
    await jwt.validateJwt(null, decodedToken, true);

    // Create product
    const requestBody = await request.json();
    const productKey = validateDataKey(requestBody.key);
    const productName = validateName(requestBody.name);
    const baseUrl = decodedToken.payload.origin;
    const ownerId = currentUserId;
    if (baseUrl == null || ownerId == null) {
      throw new ValidationError(401, "JWT token did not contain 'origin' and 'userId' as expected.", decodedToken.payload);
    }
    await actions.createProduct(productKey, productName, baseUrl, ownerId);

    return response(201, responseHeaders, {
      "key": productKey,
      "href": '/products/' + productKey
    });
  }

  if (pathParts.length >= 2 && pathParts[0] == "products") {
    const productKey = validateDataKey(pathParts[1]);
    const productData = await actions.getProductData(productKey);
    responseHeaders.set('Access-Control-Allow-Origin', productData.base_url);

    // Require valid JWT for all  write operations
    if (method == "POST" || method == "PUT" || method == "DELETE") {
      if (encodedToken == null) {
        return response(401, responseHeaders, {
          "message": "Not authorized",
          "detail": "No JWT found"
        });
      }
      await jwt.validateJwt(productData, decodedToken, true);
    }

    if (pathParts.length == 2) {
      // Read product
      if (method == "GET") {
        const output = actions.formatProductData(productKey, productData);
        return response(200, responseHeaders, { "product": output });
      }

      // Delete product
      if (method == "DELETE") {
        await actions.deleteProduct(productKey);
        return response(200, responseHeaders, { "delete": true });
      }
    }

    if (pathParts.length == 3 && pathParts[0] == "products" && pathParts[2] == "owners") {
      if (method == "GET") {
        return response(200, responseHeaders, {
          "owners": productData.owners
        });
      }
      if (method == "POST") {
        // Add owner
        const requestBody = await request.json();
        const newOwner = requestBody.owner;
        // validate body
        if (newOwner === undefined) {
          return response(400, responseHeaders, {
            "message": "Please provide required fields",
            "required_fields": ["owner"],
            "endpoint": endpoint
          });
        }
        productData.owners.push(newOwner);
        const savedOwners = await actions.setProductOwners(productKey, productData, productData.owners, currentUserId);
        return response(200, responseHeaders, {
          "owners": savedOwners
        });
      }
      if (method == "PUT") {
        // Set owners
        const requestBody = await request.json();
        const newOwners = requestBody.owners;
        // validate body
        if (newOwners === undefined) {
          return response(400, responseHeaders, {
            "message": "Please provide required fields",
            "required_fields": ["owners"],
            "endpoint": endpoint
          });
        }
        const savedOwners = await actions.setProductOwners(productKey, productData, newOwners, currentUserId);
        return response(200, responseHeaders, {
          "owners": savedOwners
        });
      }
    }

    if (pathParts.length == 3 && pathParts[0] == "products" && pathParts[2] == "areas") {
      if (method == "POST") {
        // Create product area
        const requestBody = await request.json();
        const productAreaKey = validateDataKey(requestBody.key);
        const productAreaName = validateName(requestBody.name);
        await actions.createProductArea(productKey, productAreaKey, productAreaName);
        return response(201, responseHeaders, {
          "key": productAreaKey,
          "href": '/products/' + productKey + '/areas/' + productAreaKey
        });
      }
    }
    if (pathParts.length >= 4 && pathParts[0] == "products" && pathParts[2] == "areas") {
      const productAreaKey = pathParts[3]
      const productAreaData = await actions.getProductAreaData(productKey, productAreaKey);
      if (productAreaData == null) {
        return response404(responseHeaders, endpoint);
      }

      if (pathParts.length == 4 && pathParts[0] == "products" && pathParts[2] == "areas") {
        // Read product area 
        if (method == "GET") {
          const formattedProductAreaData = await actions.formatProductAreaData(productKey, productData, productAreaKey, productAreaData);
          return response(200, responseHeaders, { "product_area": formattedProductAreaData });
        }
        if (method == "DELETE") {
          await actions.deleteProductArea(productKey, productAreaKey);
          return response(200, responseHeaders, {
            "deleted": true
          });
        }
      }

      // Create item
      if (method == "POST" && pathParts.length == 5 && pathParts[0] == "products" && pathParts[2] == "areas" && pathParts[4] == "items") {
        const requestBody = await request.json();
        const postId = requestBody.post_id;
        // validate body
        if (postId === undefined || requestBody.name === undefined || requestBody.img_url === undefined) {
          return response(400, responseHeaders, {
            "message": "Please provide required fields",
            "required_fields": ["name", "post_id", "img_url"],
            "endpoint": endpoint
          });
        }
        const itemName = validateName(requestBody.name);
        await actions.addProductAreaItem(productKey, productData, productAreaKey, productAreaData, itemName, postId, requestBody.img_url);

        return response(201, responseHeaders, {
          "key": postId,
          "href": '/products/' + productKey + '/areas/' + productAreaKey + '/items/' + postId
        });
      }

      if (pathParts.length >= 6 && pathParts[0] == "products" && pathParts[2] == "areas" && pathParts[4] == "items") {
        const postId = pathParts[5];

        // Update item
        if (method == "PUT" && pathParts.length == 6) {
          const requestBody = await request.json();
          await actions.updateProductAreaItem(productKey, productData, productAreaKey, productAreaData, postId, requestBody.name, requestBody.img_url);
          return response(200, responseHeaders, {});
        }

        // Delete item
        if (method == "DELETE" && pathParts.length == 6) {
          await actions.deleteProductAreaItemByPostId(productKey, productAreaKey, productAreaData, postId);
          return response(200, responseHeaders, {
            "deleted": true
          });
        }
      }
    }
  }

  if (method === "OPTIONS") {
    return new Response('', { headers: responseHeaders, status: 200 })
  }

  return response404(responseHeaders, endpoint);
}

function validateDataKey(key) {
  if (key.length < 2) {
    throw new ValidationError(400, "Key must be at least 2 characters long", key);
  }
  if (key.startsWith("_")) {
    throw new ValidationError(400, "Key cannot start with underscore", key);
  }
  return key;
}
function validateName(name) {
  name = name.trim();
  if (name.length < 2) {
    throw new ValidationError(400, "Name must be at least 2 characters long", name);
  }
  return name;
}

// reusable response functions
function response(status, responseHeaders, jsonBody) {
  return new Response(JSON.stringify(jsonBody), { status: status, headers: responseHeaders });
}
function response404(responseHeaders, endpoint) {
  return response(404, responseHeaders, {
    "message": "Not found",
    "endpoint": endpoint
  })
}