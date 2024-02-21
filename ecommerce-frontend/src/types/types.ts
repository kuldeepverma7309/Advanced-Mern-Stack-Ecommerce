

export interface User {
    name:string;
    email:string;
    photo:string;
    gender:string;
    role:string;
    dob:string;
    _id:string;
}

export interface Product {
    name:string;
    price:number,
    stock:number;
    category:string;
    photo:string;
    _id:string;

}

export type ShippingInfo = {
    address:string;
    city:string;
    state:string;
    country:string;
    pinCode:number;
}

export type CartItem = {
    productId:string,
    photo:string,
    name:string,
    price:number,
    quantity:number,
    stock:number,
}


export type OrderItem = {
  productId: string;
  photo: string;
  name: string;
  price: number;
  quantity: number;
  _id:string;
};

export type Order = {
    orderItems: OrderItem[];
    shippingInfo:ShippingInfo;
    subtotal:number;
    tax:number;
    shippingCharges:number;
    discount:number;
    total:number;
    status:string;
    user:{
        name:string;
        _id:string;
    };
    _id:string;
}

type LatestTransaction = {
    _id:string;
    amount:number;
    discount:number;
    quantity:number;
    status:string;
}

 type CountAndChange= {
    user: number,
    product: number,
    order: number,
    revenue: number,
}


export type Stats = {
  categoryCount: Record<string, number>[];
  changePercent: CountAndChange,
  count: CountAndChange,
  chart: {
    order: number[];
    revenue: number[];
  };
  userRatio: {
    male: number;
    female: number;
  };
  latestTransactions: LatestTransaction[];
};

type RevenueDistribution = {
  
    netMargin: number;
    grossIncome: number;
    discount: number;
    produtionCost: number;
    burnt: number;
    marketingCost: number;
};


export type Pie = {
  orderfullfillment: {
    processing: number;
    shipped: number;
    delivered: number;
  };
  productCategories: Record<string, number>[];

  stockAvailability: {
    inStock: number;
    outOfStock: number;
  };

  revenueDistribution:RevenueDistribution;

  usersAgeGroup: {
    teen: number;
    adult: number;
    senior: number;
  };

  adminCustomer: {
    admin: number;
    customer: number;
  };

};

export type Bar = {
  users: number[];
  products: number[];
  orders: number[];
};

export type Line = {
  users: number[];
  products: number[];
  discount: number[];
  revenue: number[];
};