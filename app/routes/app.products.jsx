import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useLoaderData } from "@remix-run/react";

import { useSearchParams } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";

import {
  Page,
  BlockStack,
  Pagination,
  IndexTable,
  LegacyCard,
  Link,
  Text,
  Thumbnail,
  useBreakpoints,
} from "@shopify/polaris";

import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { productsAll } from "../models/product.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page"), 10) || 1;
  const nextPageInfo = JSON.parse(url.searchParams.get("pageInfo"));
  const response = await productsAll(admin, session, nextPageInfo);
  return json({products: response.products, page, pageInfo: response.pageInfo});
};

export default function Products() {
  const data = useLoaderData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const nextPage = () => {
    navigate(`?page=${data.page+1}&pageInfo=${JSON.stringify(data.pageInfo?.nextPage?.query)}`);
  }

  const prevPage = () => {
    navigate(`?page=${data.page-1}&pageInfo=${JSON.stringify(data.pageInfo?.prevPage?.query)}`);
  }

  return (
    <Page
      backAction={{content: 'Overview', url: "/app"}}
      title="Products"
    >
      { LinkIndexTable(data.products, {
        singular: 'product',
        plural: 'products',
      }) }
      <div style={{ padding: '14px var(--p-space-200)' }} >
        <BlockStack inlineAlign="center">
          <Pagination
            hasPrevious={data.pageInfo?.prevPage}
            onPrevious={prevPage}
            hasNext={data.pageInfo?.nextPage}
            onNext={nextPage}
          />
          <Text>{data.page}</Text>
        </BlockStack>
      </div>
    </Page>
  );
}


function LinkIndexTable(products, resourceName) {

  const rowMarkup = products.map(
    ({id, title, handle, variantsCount, image}, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
      >
        <IndexTable.Cell>
          {
            image?.src ?
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
          {variantsCount}
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <LegacyCard>
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
    </LegacyCard>
  );
}

function productPageLink(id) {
  return `/app/product/${id}`;
}
