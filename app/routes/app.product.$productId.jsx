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
  TextField,
  PageActions,
} from "@shopify/polaris";

import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const data = {
    ...Object.fromEntries(await request.formData()),
  };

  const responseData = await admin.rest.put({
    path: `products/${params.productId}`,
    data: {"product":{"id": id, "body_html": data.body_html, variants: JSON.parse(data.variants)}},
  });
  const responseDataJson = await responseData.json();

  return json({product: responseDataJson.product});
};

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const responseData = await admin.rest.get({
    path: `products/${params.productId}`,
  });
  const data = await responseData.json();

  return json({product: data.product});
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
      variants: JSON.stringify(formState.product.variants),
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
      const variants = formState.product.variants.map((variant, index) => {
        if(position === index) {
          variant.price = variantPrice;
        }
        return variant;
      });
      return setFormState({ ...formState, product: {...formState.product, variants: variants}});
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
                <Text> Update your variant prices:</Text>
                {formState.product.variants.map((variant, index) => (
                  <Card key={variant.id}>
                    <TextField
                        label={variant.title}
                        value={variant.price}
                        onChange={newPrice => priceChange(newPrice, index)}
                        prefix="$"
                        autoComplete="off"
                      />
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