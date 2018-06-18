import {
    Context,
    Callback
} from 'aws-lambda';
var AWS = require('aws-sdk-mock');
var AWS_SDK = require('aws-sdk')


const mock_data = {
    with_id: {
        "Item": {
            "updatedAt": "Mon, 18 Jun 2018 04:29:54 GMT",
            "createdAt": "Mon, 18 Jun 2018 04:29:54 GMT",
            "price": 23.00,
            "is_sales_tax": true,
            "description": "dummy description 3",
            "id": "3f9c5260-72b0-11e8-b9bb-2d91ed524476",
            "name": "dummy product",
            "is_import_duty": false
        }
    },
    purchase_1: {
        "Items": [
            {
                
                "price": 16.00,
                "is_sales_tax": false,
                "quantity": 1,
                "description": "Product description 2",
                "id": "71d8d3c0-7247-11e8-a0f7-17a713837eba",
                "name": "1 16lb bag of Skittles",
                "is_imported": false
            },
            {
                "price": "99.99",
                "quantity": 1,
                "is_sales_tax": true,
                "description": "Product description 3",
                "id": "dc0d0c80-7246-11e8-b5b6-5da1b79eeb3c",
                "name": "1 Walkman",
                "is_imported": false
            },
            {
                "price": "0.99",
                "quantity": 1,
                "is_sales_tax": false,
                "description": "Product description 3",
                "id": "dc0d0c80-7246-11e8-b5b6-5da1b79eeb3c",
                "name": "1 bag of microwave Popcorn",
                "is_imported": false
            }
        ]
    },
    purchase_2: {
        "Items": [
            {
                
                "price": "11.00",
                "is_sales_tax": false,
                "quantity": 1,
                "description": "Product description 2",
                "id": "71d8d3c0-7247-11e8-a0f7-17a713837eba",
                "name": "1 imported bag of Vanilla-Hazelnut Coffee",
                "is_imported": true
            },
            {
                "price": "15,001.25",
                "quantity": 1,
                "is_sales_tax": true,
                "description": "Product description 3",
                "id": "dc0d0c80-7246-11e8-b5b6-5da1b79eeb3c",
                "name": "1 Imported Vespa",
                "is_imported": true
            }
        ]
    },
    purchase_3: {
        "Items": [
            {
                "price": 75.99,
                "is_sales_tax": false,
                "quantity": 1,
                "description": "Product description 2",
                "id": "71d8d3c0-7247-11e8-a0f7-17a713837eba",
                "name": "imported crate of Almond Snickers",
                "is_imported": true
            },
            {
                "price": 55.00,
                "is_sales_tax": true,
                "quantity": 1,
                "description": "Product description 2",
                "id": "71d8d3c0-7247-11e8-a0f7-17a713837eba",
                "name": "Discman",
                "is_imported": false
            },
            {
                "price": 10.00,
                "is_sales_tax": true,
                "quantity": 1,
                "description": "Product description 2",
                "id": "71d8d3c0-7247-11e8-a0f7-17a713837eba",
                "name": "Imported Bottle of Wine",
                "is_imported": true
            },
            {
                "price": 997.99,
                "is_sales_tax": false,
                "quantity": 1,
                "description": "Product description 2",
                "id": "71d8d3c0-7247-11e8-a0f7-17a713837eba",
                "name": "300# bag of Fair-Trade Coffee",
                "is_imported": false
            }
        ]
    }
}

AWS.setSDKInstance(AWS_SDK);
AWS.mock('DynamoDB.DocumentClient', 'get', (params: any, callback: any) => {
    if(params.Key.id === mock_data.with_id.Item.id)
        callback(null, mock_data.with_id);
    else
    callback(null, {}); 
});

import { product, purchased } from '../handler';
import { expect } from 'chai';
import {
    table_info
} from '../models/models';

describe("AWS Lambda end-points product with Single ID", () => {
    let event: any = {
        body: {
            id: "3f9c5260-72b0-11e8-b9bb-2d91ed524476"
        }
    };
    let context: Context;

    it("Get single Product based on id", (done) => {
        let callback: Callback = (error: any, data: any) => {
            expect(data.statusCode).to.equal(200);
            let body = JSON.parse(data.body)
            expect(body.Item.name).to.equal('dummy product');
            done();
        }
        product(event, context, callback);

    });
    afterEach((done) => {
        AWS.restore('DynamoDB.DocumentClient');
        done();
    })
});

describe("Verify Proudct Sales receipt ", () => {
    let context: Context;
    it("First Sale Receipt with Total : 126.98 and Sales Tax 10.00", (done) => {
        let event: any = {
            body: mock_data.purchase_1
        };
        let callback: Callback = (error: any, data: any) => {
            expect(data.statusCode).to.equal(200);
            let body = JSON.parse(data.body);
            expect(body.length).to.equal(4);
            expect(body[0].amount_with_tax).to.equal('16.00');
            expect(body[1].amount_with_tax).to.equal('109.99');
            expect(body[2].amount_with_tax).to.equal('0.99');
            expect(body[3].total_sales_tax).to.equal('10.00');
            expect(body[3].total_amount).to.equal('126.98');
            done();
        }
        purchased(event, context, callback);
    });
    it("Second Sale Receipt with Total : 17,263.00 and Sales Tax 2250.75", (done) => {
        let event: any = {
            body: mock_data.purchase_2
        };
        let callback: Callback = (error: any, data: any) => {
            expect(data.statusCode).to.equal(200);
            let body = JSON.parse(data.body);
            expect(body.length).to.equal(3);
            expect(body[0].amount_with_tax).to.equal('11.55');
            expect(body[1].amount_with_tax).to.equal('17,251.45');
            expect(body[2].total_sales_tax).to.equal('2250.75');
            expect(body[2].total_amount).to.equal('17,263.00');
            
            done();
        }
        purchased(event, context, callback);
    });
    it("Third Sale Receipt with Total : 1,149.78 and Sales Tax 10.8", (done) => {
        let event: any = {
            body: mock_data.purchase_3
        };
        let callback: Callback = (error: any, data: any) => {
            expect(data.statusCode).to.equal(200);
            let body = JSON.parse(data.body);
            expect(body.length).to.equal(5);
            expect(body[0].amount_with_tax).to.equal('79.79');
            expect(body[1].amount_with_tax).to.equal('60.50');
            expect(body[2].amount_with_tax).to.equal('11.50');
            expect(body[3].amount_with_tax).to.equal('997.99');
            expect(body[4].total_sales_tax).to.equal('10.80');
            expect(body[4].total_amount).to.equal('1,149.78');
            done();
        }
        purchased(event, context, callback);
    });
});
