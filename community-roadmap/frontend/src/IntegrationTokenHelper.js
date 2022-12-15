class IntegrationTokenHelper {
    constructor(tokenEndpointUrl) {
        this.tokenEndpointUrl = tokenEndpointUrl;
        this.__cache = {
            current_user: null,
            latest_integration_token: { ts: -1 },
        };
    }
    async withIntegrationToken() {
        var currentTimestamp = new Date().getTime();
        if (this.__cache.latest_integration_token.ts + 60000 > currentTimestamp) {
            console.log("Reusing cached HC integration token");
            var token = this.__cache.latest_integration_token.token
            return new Promise(function (resolve, reject) { resolve(token) });
        }
        console.log("Fetching new HC integration token");
        return fetch(this.tokenEndpointUrl).then(response => response.json()).then(data => {
            var token = data.token;
            this.__cache.latest_integration_token.token = token;
            this.__cache.latest_integration_token.ts = new Date().getTime();
            return token;
        });
    }
    async fetch(url, options) {
        if (options === undefined) {
            options = {};
        }
        if (options.headers === undefined) {
            options.headers = {};
        }
        return this.withIntegrationToken().then(token => {
            options.headers['Authorization'] = 'Bearer ' + token;
            return fetch(url, options);
        });
    }
    isAdmin() {
        if (window.HelpCenter) {
            console.log("HelpCenter user role: " + window.HelpCenter.user.role);
            if (window.HelpCenter.user.role === "manager") {
                return true;
            }
        } else {
            console.log("Could not resolve HelpCenter user role");
        }
        return false;
    }
}

export default IntegrationTokenHelper