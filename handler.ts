import {
  Handler,
  Context,
  Callback
} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
const dynamoDb = new DynamoDB.DocumentClient({ region: 'us-east-1' });
import {
  Response,
} from './models/models';

import {
  adapt,
  scanProduct,
  queryProduct,
  createProduct,
  purchasedReceipt
} from './actions/actions';

let resonseObject = (res: any, status_code: number) => {
  const response: Response = {
    statusCode: status_code,
    body: res
  }
  return response;
}

// Get All Product Details
const allproduct: Handler = (event: any, context: Context, callback: Callback) => {

  let isScanned = scanProduct(dynamoDb);
  let respondToClient: Response;
  isScanned.then((res) => {
    respondToClient = resonseObject(JSON.stringify(res), 200);
    callback(undefined, respondToClient);
  });
  isScanned.catch((err) => {
    respondToClient = resonseObject(JSON.stringify(err), 200);
    callback(undefined, respondToClient)
  });
};

//Get Specific Product using ID
const product: Handler = (event: any, context: Context, callback: Callback) => {
  
  let isQuery = queryProduct(event, dynamoDb);
  let respondToClient: Response;
  isQuery.then((res) => {
    respondToClient = resonseObject(JSON.stringify(res), 200);
    callback(undefined, respondToClient);
  });
  isQuery.catch((err) => {
    respondToClient = resonseObject(JSON.stringify(err), 200);
    callback(undefined, respondToClient)
  });
};

const addproduct: Handler = (event: any, context: Context, callback: Callback) => {
  let isCreated = createProduct(event, dynamoDb);
  let respondToClient: Response;
  isCreated.then((res) => {
    respondToClient = resonseObject(JSON.stringify(res), 200);
    callback(undefined, respondToClient);
  });
  isCreated.catch((err) => {
    respondToClient = resonseObject(JSON.stringify(err), 200);
    callback(undefined, respondToClient)
  });

};

const purchased: Handler = (event: any, context: Context, callback: Callback) => {
  let receipt = purchasedReceipt(event);
  callback(undefined, resonseObject(JSON.stringify(receipt), 200))
};

export { product, addproduct, allproduct, purchased }