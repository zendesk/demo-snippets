class RoadmapDb {
    constructor(kvdata) {
        this.kvdata = kvdata;
    }
    async getData(key) {
        return this.kvdata.get(key, { type: "json" });
    }
    async saveData(key, obj) {
        return this.kvdata.put(key, JSON.stringify(obj));
    }
    async deleteDataWithPrefix(key) {
        const result = await this.kvdata.list({ "prefix": key });
        for (var i = 0; i < result.keys.length; i++) {
            const keyName = result.keys[i].name;
            if (keyName.startsWith(key)) {
                await this.kvdata.delete(keyName);
            }
        }
        return this.kvdata.delete(key);
    }
}

module.exports = { RoadmapDb };