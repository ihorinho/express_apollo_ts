import { RESTDataSource, AugmentedRequest } from '@apollo/datasource-rest';

class UserAPI extends RESTDataSource {
    override baseURL = 'http://beacon.local/rest/V1/';
    private token: string;


    constructor(token: string) {
        super();
        this.token = token;
    }


    override willSendRequest(_path: string, request: AugmentedRequest) {
        request.headers['authorization'] = 'Bearer ' + this.token;
    }


    async getProduct(sku: string) {
        return this.get(`products/${encodeURIComponent(sku)}`)
    }
}


export default UserAPI;