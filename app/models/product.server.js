export async function productFind(admin, session, id) {
  
}

export async function productsAll(admin, session) {
  return admin.rest.resources.Product.all({ session });
}

export async function productUpdate(admin, session, data) {
}