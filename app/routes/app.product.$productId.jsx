import { useEffect, useState, useCallback } from "react";
import { json } from "@remix-run/node";
import { ExitIcon } from "@shopify/polaris-icons";
import { useActionData, useLoaderData, useSubmit  } from "@remix-run/react";

import {
  Page,
  Text,
  Card,
  Button,
  BlockStack,
  FormLayout,
  Layout,
  Box,
  List,
  Link,
  InlineStack,
  TextField,
  Icon,
  PageActions,
} from "@shopify/polaris";

import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const id = params.productId;
  console.log("Server save");
  const data = {
    ...Object.fromEntries(await request.formData())
  };
  console.log(JSON.stringify(data));
  const product = await admin.rest.resources.Product.find({ session, id });
  product.body_html = data.body_html;
  await product.save({
    update: true,
  });
  // admin.graphql.
  return json(product);
};

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const id = params.productId;

  const [product, metafields] = await Promise.all([
    admin.rest.resources.Product.find({session, id}), //, fields: ['title', 'body_html', 'variants']
    admin.rest.resources.Metafield.all({session, id})
  ]);

  return json({product, metafields});
};

export default function ProductDetails() {
  const {product, metafields} = useLoaderData();

  const [formState, setFormState] = useState(product);

  const [cleanFormState, setCleanFormState] = useState(product);

  // const [bodyHtml, setBodyHtml] = useState(product.body_html);
  // console.log(`Metafields ${JSON.stringify(metafields.data)}`);

  const submit = useSubmit();
  function handleSave() {
    console.log('save run');
    const data = {
      body_html: formState.body_html,
      productId: formState.productId || "",
    };
    console.log(`Data: ${JSON.stringify(data)}`);

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  const handleChange = useCallback(
    (newValue) => setBodyHtml(newValue),
    [],
  );
  return (
    <Page
      backAction={{content: 'Products', url: "/app/products"}}
      title={product.title}
      >

      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <Button
                url={`shopify:admin/products/${product.id}`}
                target="_top"
              >
              View in admin
            </Button>
              <FormLayout>
                <TextField
                  label="Product JSON"
                  value={JSON.stringify(product.variants[0].option1, null, 2)}
                  // onChange={handleChange}
                  multiline={4}
                  autoComplete="off"
                />

                <TextField
                  label="Product Metafields"
                  value={JSON.stringify(metafields.data, null, 2)}
                  // onChange={handleChange}
                  multiline={4}
                  autoComplete="off"
                />
              </FormLayout>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <PageActions
              primaryAction={{
                content: "Save",
                onAction: handleSave,
              }}
            />
            <Card>
              <Button variant="primary">
                Save
              </Button>

              <TextField
                  label="Product Description"
                  value={formState.body_html}
                  onChange={(body_html) => setFormState({ ...formState, body_html })}
                  multiline={4}
                  autoComplete="off"
                />
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}