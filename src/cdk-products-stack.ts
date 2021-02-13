import { CfnOutput, Construct, Duration, Expiration, RemovalPolicy, Stack, StackProps } from 'monocdk';
import * as appsync from 'monocdk/aws-appsync';
import * as cognito from 'monocdk/aws-cognito';
import * as ddb from 'monocdk/aws-dynamodb';
import * as lambda from 'monocdk/aws-lambda';


export class CdkProductsStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // define resources here...
    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
    });

    const api = new appsync.GraphqlApi(this, 'ApiApp', {
      name: 'cdk-product-api',
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      schema: appsync.Schema.fromAsset('./graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365)),
          },
        },
        additionalAuthorizationModes: [{
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
          },
        }],
      },
    });

    // Create the function
    const apiLambda = new lambda.Function(this, 'ApiAppHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'lib/index.handler',
      code: lambda.Code.fromAsset('lambda'),
      memorySize: 1024,
    });

    // Set the new Lambda function as a data source for the AppSync API
    const apiDs = api.addLambdaDataSource('LambdaDatasource', apiLambda);
    apiDs.createResolver({
      typeName: 'Query',
      fieldName: 'getProductById',
    });

    apiDs.createResolver({
      typeName: 'Query',
      fieldName: 'listProducts',
    });

    apiDs.createResolver({
      typeName: 'Query',
      fieldName: 'productsByCategory',
    });

    apiDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'createProduct',
    });

    apiDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteProduct',
    });

    apiDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateProduct',
    });


    const productTable = new ddb.Table(this, 'ProductTable', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Add a global secondary index to enable another data access pattern
    productTable.addGlobalSecondaryIndex({
      indexName: 'productsByCategory',
      partitionKey: {
        name: 'category',
        type: ddb.AttributeType.STRING,
      },
    });

    // Enable the Lambda function to access the DynamoDB table (using IAM)
    productTable.grantFullAccess(apiLambda);

    // Create an environment variable that we will use in the function code
    apiLambda.addEnvironment('PRODUCT_TABLE', productTable.tableName);


    new CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });

    new CfnOutput(this, 'AppSyncAPIKey', {
      value: api.apiKey || '',
    });

    new CfnOutput(this, 'ProjectRegion', {
      value: this.region,
    });

    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });
  }
}
