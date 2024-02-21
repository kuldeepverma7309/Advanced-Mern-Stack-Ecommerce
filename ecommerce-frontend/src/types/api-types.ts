import { CartItem, Order, Product, ShippingInfo, User,Stats, Pie, Bar, Line } from "./types";


export type MessageResponse = {
    success:boolean;
    message:string;
}

export type UserResponse = {
    success:boolean;
    user:User;
}

export type AllProductsResponse = {
    success:boolean;
    products:Product[];
}

export type CustomError = {
    status:number;
    data:{
        message:string;
        success:boolean;
    }
}

export type categoriesResponse = {
    success:boolean;
    categories:string[];
}

export type SearchProductResponse = {
    success:boolean;
    products:Product[];
    totalPages:number;
}

export type SearchProductRequest = {
    search:string;
    price:number;
    category:string;
    page:number;
    sort:string;
}

export type NewProductRequest = {
    id:string;
    formData:FormData;
    
}
export type ProductsResponse = {
  success: boolean;
  product: Product;
};

export type UpdateProductRequest = {
  userId: string;
  productId: string;
  formData: FormData;
};

export type DeleteProductRequest = {
  userId: string;
  productId: string;
};

export type NewOrderRequest = {
    shippingInfo:ShippingInfo;
    orderItems:CartItem[];
    subtotal:number;
    tax:number;
    shippingCharges:number;
    discount:number;
    total:number;
    user:string;
}

export type AllOrderResponse = {
    success:boolean;
    orders:Order[]
}


export type OrderDetailsResponse = {
    success:boolean;
    order:Order
}


export type UpdateOrderRequest = {
 userId:string;
 orderId:string;
};


export type AllUsersResponse = {
    success:boolean;
    users:User[];
}
export type DeleteUserRequest = {
    userId:string;
    adminUserId:string;
}

export type StatsResponse = {
    success:boolean;
    stats:Stats;
}

export type PieResponse = {
  success: boolean;
  charts: Pie;
};


export type BarResponse = {
  success: boolean;
  charts: Bar;
};


export type LineResponse = {
    success: boolean;
    charts: Line;
}