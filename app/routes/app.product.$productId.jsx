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

export const SAVE_BAR_ID = 'launchify-product-edit-save-bar';

import { SaveBar, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { validateProduct, productFind, productUpdate } from "../models/product.server";

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const data = {
    ...Object.fromEntries(await request.formData()),
  };
  data.variants = JSON.parse(data.variants); // decode JSON

  const errors = validateProduct(data);
  if (errors) {
    return json({ errors }, { status: 422 });
  }

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
  const errors = useActionData()?.errors || {};
  const formModel = useLoaderData();
  const formModelJSON = JSON.stringify(formModel);

  const [formState, setFormState] = useState(JSON.parse(formModelJSON));

  const [cleanFormState, setCleanFormState] = useState(JSON.parse(formModelJSON));

  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const shopify = useAppBridge();
  useEffect(() => {
    if (isDirty) {
      shopify.saveBar.show(SAVE_BAR_ID);
    } else {
      shopify.saveBar.hide(SAVE_BAR_ID);
    }
  }, [isDirty, shopify])

  const nav = useNavigation();
  const isSaving = nav.state === "submitting";

  const submit = useSubmit();
  function handleSave() {
    console.log('save run');
    const data = {
      body_html: formState.product.body_html,
      variants: JSON.stringify(formState.product.variants),
    };
    setCleanFormState({ ...JSON.parse(JSON.stringify(formState)) });
    submit(data, { method: "post" });
  }

  const handleChange = useCallback(
    (newValue) => setBodyHtml(newValue),
    [],
  );

  const priceChange = useCallback(
    (existingFormState, variantPrice, position) => {
      const variants = existingFormState.product.variants.map((variant, index) => {
        if(position === index) {
          variant.price = variantPrice;
        }
        return variant;
      });
      return setFormState({ ...existingFormState, product: {...existingFormState.product, variants: variants}});
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
                        onChange={newPrice => priceChange(formState, newPrice, index)}
                        prefix="$"
                        autoComplete="off"
                        error={errors[`variant-${variant.id}`]}
                      />
                  </Card>
                ))}

              </FormLayout>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <TextField
                  label="Product Description"
                  value={formState.product.body_html || ""}
                  onChange={(body_html) => setFormState({ ...formState, product: {...formState.product, body_html }})}
                  multiline={4}
                  autoComplete="off"
                  error={errors.body_html}
                />
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
      <SaveBar id={SAVE_BAR_ID}>
        <button
          variant="primary"
          onClick={() => {
            handleSave();
          }}
        >
          Save
        </button>
        <button
          onClick={() => {
            setFormState(JSON.parse(formModelJSON));
          }}
        >
          Discard
        </button>
      </SaveBar>
    </Page>
  );
}