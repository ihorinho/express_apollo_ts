import { RESTDataSource } from '@apollo/datasource-rest';
class UserAPI extends RESTDataSource {
    constructor(token) {
        super();
        this.baseURL = 'http://beacon.local/rest/V1/';
        this.token = token;
    }
    willSendRequest(_path, request) {
        request.headers['authorization'] = 'Bearer ' + this.token;
    }
    async getProduct(sku) {
        return this.get(`products/${encodeURIComponent(sku)}`);
    }
}
export default UserAPI;
