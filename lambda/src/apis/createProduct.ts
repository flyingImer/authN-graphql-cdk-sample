import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import Product from '../types/Product';
const docClient = new AWS.DynamoDB.DocumentClient();

async function createProduct(product: Product) {
  if (!product.id) {
    product.id = uuid();
  }
  const params = {
    TableName: process.env.PRODUCT_TABLE!,
    Item: product,
  };
  try {
    await docClient.put(params).promise();
    return product;
  } catch (err) {
    console.log('DynamoDB error: ', err);
    return null;
  }
}

export default createProduct;