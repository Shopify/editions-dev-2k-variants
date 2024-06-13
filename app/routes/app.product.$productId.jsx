import { useEffect, useState, useCallback } from "react";
import { json } from "@remix-run/node";
import { ExitIcon } from "@shopify/polaris-icons";
import { useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
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
import { productFind, productUpdate } from "../models/product.server";

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const data = {
    ...Object.fromEntries(await request.formData()),
  };
  data.variants = JSON.parse(data.variants); // decode JSON

  const responseDataJson = productUpdate(admin, params.productId, data);

  return json({product: responseDataJson.product});
};

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const id = params.productId;
  
  const product = await productFind(admin, id);
  return json({product});
};

export default function ProductDetails() {
  const formModel = useLoaderData();

  const [formState, setFormState] = useState(formModel);

  const [cleanFormState, setCleanFormState] = useState(formModel);

  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving = nav.state === "submitting";

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
                // loading: isSaving,
                // disabled: !isDirty || isSaving,
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