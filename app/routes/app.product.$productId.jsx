import { useEffect, useState, useCallback } from "react";
import { json } from "@remix-run/node";
import { ExitIcon } from "@shopify/polaris-icons";
import { useActionData, useLoaderData, useSubmit  } from "@remix-run/react";
import { DataType } from '@shopify/shopify-api';

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
import shopify from "../shopify.server";

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const id = params.productId;
  const product_id = id;
  console.log("Server save");
  const data = {
    ...Object.fromEntries(await request.formData()),
  };

  const inputJson =  {"product":{"id":id,"body_html": data.body_html, variants: JSON.parse(data.variants)}};
  console.log("CCCC - inputJson", inputJson)
  const responseData = await admin.rest.put({
    path: `products/${id}`,
    data:inputJson,
  });
  const responseDataJson = await responseData.json();
  console.log("bbbbbbbbb", responseDataJson.product.variants);
  
  const [product, variants] = await Promise.all([
    admin.rest.resources.Product.find({session, id}),
    admin.rest.resources.Variant.all({session, product_id}),
  ]);

  return json({product, variants});
};

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const id = params.productId;
  const product_id = id;

  console.log("Shopify", shopify);

  const responseData = await admin.rest.get({
    path: `products/${id}`,
  });
  const data = await responseData.json();
  console.log("aaaaaaaa", data.product.variants);

  const [product, variants] = await Promise.all([
    admin.rest.resources.Product.find({session, id}),
    admin.rest.resources.Variant.all({session, product_id}),
  ]);

  product.variants // option1, option2, option3, admin_graphql_api_id // some how a filtered view of product.variants

  return json({product, variants});
};

export default function ProductDetails() {
  const formModel = useLoaderData();

  const [formState, setFormState] = useState(formModel);

  const [cleanFormState, setCleanFormState] = useState(formModel);

  const submit = useSubmit();
  function handleSave() {
    console.log('save run');
    const data = {
      body_html: formState.product.body_html,
      variants: JSON.stringify(formState.variants.data),
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  const handleChange = useCallback(
    (newValue) => setBodyHtml(newValue),
    [],
  );

  const priceChange = useCallback(
    (variantPrice, position) => {
      const variants = formState.variants.data.map((variant, index) => {
        if(position === index) {
          variant.price = variantPrice;
        }
        return variant;
      });
      return setFormState({ ...formState, variants: { data: variants}});
    },
    [],
  );
  return (
    <Page
      backAction={{content: 'Products', url: "/app/products"}}
      title={formModel.product.title}
      >

      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <Button
                url={`shopify:admin/products/${formModel.product.id}`}
                target="_top"
              >
              View in admin
            </Button>
              <FormLayout>
                <TextField
                  label="Product JSON"
                  value={JSON.stringify(formModel.product, null, 2)}
                  // onChange={handleChange}
                  multiline={4}
                  autoComplete="off"
                />

                <TextField
                  label="Product Variants"
                  value={JSON.stringify(formModel.variants.data, null, 2)}
                  // onChange={handleChange}
                  multiline={4}
                  autoComplete="off"
                />
                <Text> Variant below</Text>

                {formState.variants.data.map((variant, index) => (
                  <Card key={`variant-price-${variant.id}`}>
                    <Text>{variant.title} - {variant.id}</Text>
                    <Text>{variant.price}</Text>
                    <TextField
                        label={variant.title}
                        value={variant.price}
                        onChange={newPrice => priceChange(newPrice, index)}
                        prefix="$"
                        autoComplete="off"
                      />
                    <Text>{variant.barcode}</Text>
                  </Card>
                ))}

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
              <TextField
                  label="Product Description"
                  value={formState.product.body_html}
                  onChange={(body_html) => setFormState({ ...formState, product: {...formState.product, body_html }})}
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