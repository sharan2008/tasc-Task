interface Response {
    statusCode: number;
    body: string;
}

interface ProductMetaData {
    id: string,
    name: string,
    description: string,
    price: number,
    is_sales_tax: boolean,
    is_import_duty: boolean,
    createdAt: string,
    updatedAt: string
}

interface Product {
    TableName: string,
    Item: ProductMetaData
}

enum  table_info {
    PRODUCTS = "products",
    CARTS = "carts"
}

export { Response, Product, ProductMetaData, table_info }