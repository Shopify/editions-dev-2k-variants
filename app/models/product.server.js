export function validateProduct(data) {
  const errors = {};

  if (!data.body_html) {
    errors.body_html = "Description is required";
  }

  data.variants.map((variant)=>{
    if (Number(variant.price) < 5) {
      errors[`variant-${variant.id}`] = "Variant price should be greater than $5";
    }
  });

  if (Object.keys(errors).length) {
    return errors;
  }
}

export async function productFind(admin, id) {
  const responseData = await admin.rest.get({
    path: `products/${id}`,
  });
  const { product } = await responseData.json();
  return product;
}

export async function productsAll(admin, session, currentPageInfo) {
  const { data, pageInfo } = await admin.rest.resources.Product.all({ ...currentPageInfo, session, limit: 5 });
  const products = data.map((product)=>({...product, variantsCount: product.variants.length}));
  return { products, pageInfo };
}

export async function productUpdate(admin, id, data) {
  const responseData = await admin.rest.put({
    path: `products/${id}`,
    data: {"product":{"body_html": data.body_html, variants: data.variants}},
  });
  const responseDataJson = await responseData.json();
  return responseDataJson;
}
