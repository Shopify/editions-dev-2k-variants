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
// import shopify from "../shopify.server";

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const id = params.productId;
  const product_id = id;
  console.log("Server save");
  const data = {
    ...Object.fromEntries(await request.formData())
  };
  console.log(JSON.stringify(data));
  const productRest = await admin.rest.resources.Product.find({ session, id });
  productRest.body_html = data.body_html;
  // raises: 
  // TypeError: value.reduce is not a function
  //   at file:///Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@shopify/shopify-api/dist/esm/rest/base.mjs:195:40
  //   at Array.reduce (<anonymous>)
  //   at RemixResource.serialize (file:///Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@shopify/shopify-api/dist/esm/rest/base.mjs:189:37)
  //   at RemixResource.save (file:///Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@shopify/shopify-api/dist/esm/rest/base.mjs:157:27)
  //   at action (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/app/routes/app.product.$productId.jsx:38:17)
  //   at async Object.callRouteAction (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/server-runtime/dist/data.js:37:16)
  //   at async /Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/router/dist/router.cjs.js:4230:21
  //   at async callLoaderOrAction (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/router/dist/router.cjs.js:4295:16)
  //   at async Promise.all (index 2)
  //   at async callDataStrategyImpl (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/router/dist/router.cjs.js:4170:17)
  //   at async callDataStrategy (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/router/dist/router.cjs.js:3703:19)
  //   at async submit (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/router/dist/router.cjs.js:3562:21)
  //   at async queryImpl (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/router/dist/router.cjs.js:3520:22)
  //   at async Object.queryRoute (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/router/dist/router.cjs.js:3489:18)
  //   at async handleDataRequest (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/server-runtime/dist/server.js:156:20)
  //   at async requestHandler (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/server-runtime/dist/server.js:100:18)
  //   at async nodeHandler (/Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/dev/dist/vite/plugin.js:841:27)
  //   at async /Users/ericwalker/src/github.com/Shopify/apps/editions-dev-2k-variants/node_modules/@remix-run/dev/dist/vite/plugin.js:844:15
  
  productRest.variants = data.variants;
  await productRest.save({
    update: true,
  });

  // const client = new shopify.clients.Rest({session});
  // const responseDate = await client.put({
  //   path: `products/${id}`,
  //   data: {"product":{"id":id,"body_html": data.body_html}},
  //   type: DataType.JSON,
  // });
  // console.log(JSON.stringify(data));
  
  const [product, metafields, variants] = await Promise.all([
    admin.rest.resources.Product.find({session, id}),
    admin.rest.resources.Metafield.all({session, id}),
    admin.rest.resources.Variant.all({session, product_id}),
  ]);

  return json({product, metafields, variants});
};

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const id = params.productId;
  const product_id = id;

  const [product, metafields, variants] = await Promise.all([
    admin.rest.resources.Product.find({session, id}), //, fields: ['title', 'body_html']
    admin.rest.resources.Metafield.all({session, id}),
    admin.rest.resources.Variant.all({session, product_id}),
  ]);

  product.variants // option1, option2, option3, admin_graphql_api_id // some how a filtered view of product.variants

  return json({product, metafields, variants});
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
      variants: formState.variants.data,
    };
    console.log(`Data: ${JSON.stringify(data)}`);

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
        if(postion === index) {
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
                  label="Product Metafields"
                  value={JSON.stringify(formModel.metafields.data, null, 2)}
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