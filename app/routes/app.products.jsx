import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useLoaderData } from "@remix-run/react";

import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";

import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  return json(await admin.rest.resources.Product.all({ session }));
};

export default function Products() {
  const products = useLoaderData();
  return (
    <Page>
      <TitleBar title="Products" />

      <BlockStack>
        <Text as="h2">
          Products
          { products.data.map((product) => (
            <p>
              <Link url={"/app/product/"+product.id}>{product.title}</Link>
            </p>
          ))}
        </Text>
      </BlockStack>
    </Page>
  );
}