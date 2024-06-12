import '@shopify/shopify-api/adapters/node';

import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-04";
import { Session, shopifyApi } from '@shopify/shopify-api';

const offlineSessionId = 'shpua_8c90f24db60239a1813404daa55a8552';
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecretKey = process.env.SHOPIFY_API_SECRET;

const domain = 'quickstart-01b53dbf.myshopify.com';
const headers = {'X-Shopify-Access-Token': offlineSessionId};
const session = new Session({
  id: 'offline_quickstart-01b53dbf.myshopify.com',
  shop: 'quickstart-01b53dbf.myshopify.com',
  state: '',
  isOnline: false,
});

// {
//   21:08:14 │ remix      │   id: 'offline_quickstart-01b53dbf.myshopify.com',
//   21:08:14 │ remix      │   shop: 'quickstart-01b53dbf.myshopify.com',
//   21:08:14 │ remix      │   state: '',
//   21:08:14 │ remix      │   isOnline: false,
//   21:08:14 │ remix      │   scope: 'write_products',
//   21:08:14 │ remix      │   expires: undefined,
//   21:08:14 │ remix      │   accessToken: 'shpua_8c90f24db60239a1813404daa55a8552',
//   21:08:14 │ remix      │   onlineAccessInfo: undefined
//   21:08:14 │ remix      │ }

session.accessToken = offlineSessionId;

const baseConfig = {
  apiKey: apiKey,
  apiSecretKey: apiSecretKey,
  hostName: 'offline_quickstart-01b53dbf.myshopify.com',
  hostScheme: 'https',
  apiVersion: ApiVersion.January24,
  isEmbeddedApp: true,
  isCustomStoreApp: false,
  // logger: {
  //   level: LogSeverity.Info,
  // },
}

const shopify = shopifyApi(
  baseConfig,
);

// await shopify.rest.Order.all({
//   session: session,
//   status: "any",
// });

// console.log(shopify.clients.Rest)
const client = new shopify.clients.Rest({session});

const response = await client.get({
  path: 'products/8318765301980',
});

console.log("Product", response.body.product.variants);

// const products = await shopify.clients.Rest.Product.find({
//   session: session,
//   product_id: 8318765301980,
// });

// console.log("Products", products);
