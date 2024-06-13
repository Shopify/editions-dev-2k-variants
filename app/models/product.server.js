export async function productFind(admin, id) {
  const responseData = await admin.rest.get({
    path: `products/${id}`,
  });
  const { product } = await responseData.json();
  return product;
}

export async function productsAll(admin, session) {
  const { data } = await admin.rest.resources.Product.all({ session });
  return data;
}

export async function productUpdate(admin, id, data) {
  const responseData = await admin.rest.put({
    path: `products/${id}`,
    data: {"product":{"body_html": data.body_html, variants: data.variants}},
  });
  const responseDataJson = await responseData.json();
  return responseDataJson;
}
