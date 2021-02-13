import createProduct from './apis/createProduct';
import deleteProduct from './apis/deleteProduct';
import getProductById from './apis/getProductById';
import listProducts from './apis/listProducts';
import productsByCategory from './apis/productsByCategory';
import updateProduct from './apis/updateProduct';
import Product from './types/Product';

export class Hello {
  public sayHello() {
    return 'hello, world!';
  }
}

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    productId: string;
    category: string;
    product: Product;
  };
  identity: {
    username: string;
    claims: {
      [key: string]: string[];
    };
  };
}

exports.handler = async (event:AppSyncEvent) => {
  switch (event.info.fieldName) {
    case 'getProductById':
      return getProductById(event.arguments.productId);
    case 'createProduct':
      return createProduct(event.arguments.product);
    case 'listProducts':
      return listProducts();
    case 'deleteProduct':
      return deleteProduct(event.arguments.productId);
    case 'updateProduct':
      return updateProduct(event.arguments.product);
    case 'productsByCategory':
      return productsByCategory(event.arguments.category);
    default:
      return null;
  }
};