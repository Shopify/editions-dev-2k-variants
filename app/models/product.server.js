export async function productFind(admin, id) {
  const responseData = await admin.rest.get({
    path: `products/${id}`,
  });
  const data = await responseData.json();
  return data;
}

export async function productsAll(admin, session) {
  return admin.rest.resources.Product.all({ session });
}

export async function productUpdate(admin, id, data) {
  const responseData = await admin.rest.put({
    path: `products/${id}`,
    data: {"product":{"body_html": data.body_html, variants: data.variants}},
  });
  const responseDataJson = await responseData.json();
  return responseDataJson;
}
