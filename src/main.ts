import { App } from 'monocdk';
import { CdkProductsStack } from './cdk-products-stack';

// // for development, use account/region from cdk cli
// const devEnv = {
//   account: process.env.CDK_DEFAULT_ACCOUNT,
//   region: process.env.CDK_DEFAULT_REGION,
// };

const app = new App();

new CdkProductsStack(app, 'my-cdk-products-stack');

app.synth();