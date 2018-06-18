import {
    Product,
    ProductMetaData,
    table_info
} from '../models/models';
const uuid = require('uuid');
/*formatting data type as per Dynano DB */
let adapt = (body: any, id: string) => {

    let item: ProductMetaData = {
        id,
        name: body.name,
        description: body.description,
        price: Number(body.price),
        is_sales_tax: body.is_sales_tax,
        is_import_duty: body.is_import_duty,
        createdAt: new Date().toUTCString(),
        updatedAt: new Date().toUTCString()
    }
    return item;
}
/* Scanning through table and get first 200 rows */
let scanProduct = (dynamoDb: any) => {
    let scanningParamters = {
        TableName: table_info.PRODUCTS,
        Limit: 200
    }
    const promise = new Promise((resolve, reject) => {
        dynamoDb.scan(scanningParamters, (error:any, result:any) => {
            // handle potential errors
            if (error) {
                reject({
                    err: JSON.stringify(error),
                    message: "Error Occured while fetching product detail"
                })
                return;
            }
            // successful response 
            resolve(result);
        })
    });
    return promise;
}

let JSONData = (event:any) =>{
    let body:any;
    try{
        body = JSON.parse(event.body);
    }
    catch(e){   
        body = event.body;
    }
    return body;
}

/* Query table and get specific row based on id */
let queryProduct = (event: any, dynamoDb: any) => {
    let body = JSONData(event);

    let queryParamters = {
        TableName: table_info.PRODUCTS,
        Key: {
            "id": body.id
        }
    }
    const promise = new Promise((resolve, reject) => {
        dynamoDb.get(queryParamters, (error:any, result:any) => {

            // handle potential errors
            if (error) {
                reject({
                    err: JSON.stringify(error),
                    message: "Error Occured while fetching product detail"
                })
                return;
            }
            // successful response 
            resolve(result);
        })
    });
    return promise;
}

let buildSchema = (body: any, table_name: string) => {
    let item: ProductMetaData = adapt(body, uuid.v1())

    let product: Product = {
        TableName: table_name,
        Item: item
    }

    return product;
}

let createProduct = (event: any, dynamoDb: any) => {
    let body = JSONData(event);
    let params = buildSchema(body, table_info.PRODUCTS);
    const promise = new Promise((resolve, reject) => {
        dynamoDb.put(params, (error:any, result:any) => {
            // handle potential errors
            if (error) {
                reject({
                    err: JSON.stringify(error),
                    message: "Error Occured while created Product !!!"
                })
                return;
            }
            // successful response 
            resolve({
                message: "Product created successfully!!!",
                id: params.Item.id
            });
        })
    });
    return promise;
}

/*Receipt generation */
const SALES_TAX = 0.1;
const IMPORT_SALES_TAX = 0.05;


/*Helper Functions */

let numberWithCommas = (x: any) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

let d2 = (x: any) => {
    return x.toFixed(2);
}

let roundToMultiple = (amount: any, multiple: any) => {
    var t = (1 / multiple);
    return (Math.round(amount * t) / t).toFixed(2);
}

let purchasedReceipt = (event: any) => {
    let item_list = JSONData(event);
    let receipt: any = [];
    let total_sales_tax: number = 0;;
    let total_amount: number = 0;
    item_list.Items.forEach((item:any) => {
        let sales_tax = 0;
        if (item.is_imported == true && item.is_sales_tax == true) {
            sales_tax = SALES_TAX + IMPORT_SALES_TAX;
        }
        else if (item.is_imported == true) {
            sales_tax = IMPORT_SALES_TAX;
        }
        else if (item.is_sales_tax == true) {
            sales_tax = SALES_TAX;
        }
        var amount = Number(item.price.toString().replace(",", "")) * item.quantity;
        sales_tax = Number(amount) * Number(sales_tax);
        sales_tax = Number(roundToMultiple(sales_tax, 0.05));
        amount = amount + sales_tax;

        total_amount = total_amount + amount;
        total_sales_tax = total_sales_tax + sales_tax;

        receipt.push({
            product: item.name,
            amount_with_tax: numberWithCommas(d2(amount)),
            type: "product_info"
        })
    });
    if (receipt.length > 0) {
        receipt.push({
            total_sales_tax: d2(total_sales_tax),
            total_amount: numberWithCommas(d2(total_amount)),
            type: "total_info"
        })
    }

    return receipt;
}

export {
    adapt,
    scanProduct,
    queryProduct,
    createProduct,
    purchasedReceipt
}