import { useEffect, useState, useCallback } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData  } from "@remix-run/react";

import {
  Page,
  Text,
  Card,
  Button,
  BlockStack,
  Layout,
  Box,
  List,
  Link,
  InlineStack,
  TextField,
} from "@shopify/polaris";

import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const id = params.productId;
  const product = await admin.rest.resources.Product.find({ session, id });
  return json(product);
};

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const id = params.productId;
  return json(await admin.rest.resources.Product.find({ session, id }));
};

export default function ProductDetails() {
  const product = useLoaderData();
  const [bodyHtml, setBodyHtml] = useState(product.body_html);

  const handleChange = useCallback(
    (newValue) => setBodyHtml(newValue),
    [],
  );
  return (
    <Page>
      <TitleBar title={product.title} />

      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Text as="h2">
              Product:
            </Text>
            <Box>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(product, null, 2)}
              </pre>
            </Box>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <TextField
                value={bodyHtml}
                onChange={handleChange}
                multiline={4}
            />
            <button>
              Save
            </button>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}