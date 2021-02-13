import * as AWS from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();

async function getProductById(productId: string) {
  const params = {
    TableName: process.env.PRODUCT_TABLE!,
    Key: { id: productId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    return Item;
  } catch (err) {
    console.log('DynamoDB error: ', err);
    throw err;
  }
}

export default getProductById;
