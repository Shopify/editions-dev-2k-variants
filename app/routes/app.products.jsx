import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useLoaderData } from "@remix-run/react";

import {
  BlockStack,
  Page,
  IndexTable,
  Card,
  Link,
  Text,
  Thumbnail,
  useBreakpoints,
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
    <Page
      backAction={{content: 'Overview', url: "/app"}}
      title="Products"
      >
        { LinkIndexTable(products.data, {
          singular: 'product',
          plural: 'products',
        }) }

        {/* <Text>
          {
            JSON.stringify(products.data)
          }
        </Text> */}
    </Page>
  );
}


function LinkIndexTable(products, resourceName) {

  const rowMarkup = products.map(
    ({id, title, handle, variants, image}, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
      >
        <IndexTable.Cell>
          {
            image ? 
            <Thumbnail
              source={image.src}
              alt={image.alt}
            />
            : null
          }
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Link
            dataPrimaryLink
            url={productPageLink(id)}
          >
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {title}
            </Text>
          </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {handle}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {variants.length}
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Card>
      <IndexTable
        condensed={useBreakpoints().smDown}
        resourceName={resourceName}
        itemCount={products.length}
        selectable={false}
        headings={[
          {title: ''},
          {title: 'Title'},
          {title: 'Handle'},
          {title: 'Variant count'},
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}

function productPageLink(id) {
  return "/app/product/"+id;
}
