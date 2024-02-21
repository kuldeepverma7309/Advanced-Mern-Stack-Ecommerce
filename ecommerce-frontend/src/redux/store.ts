import { configureStore } from "@reduxjs/toolkit";
import { userAPI } from "./api/userAPI";
import { userReducer } from "./reducer/userReducer";
import { productAPI } from "./api/productApi";
import { cartReducer } from "./reducer/cartReducer";
import { orderApi } from "./api/orderApi";
import { dashboardApi } from "./api/dashboardAPI";



export const server = import.meta.env.VITE_SERVER;

const middlewares = [userAPI.middleware,productAPI.middleware,orderApi.middleware,dashboardApi.middleware]

export const store = configureStore({
  reducer: {
    userApi: userAPI.reducer,
    [productAPI.reducerPath]:productAPI.reducer,
    [orderApi.reducerPath]:orderApi.reducer,
    [dashboardApi.reducerPath]:dashboardApi.reducer,
    [userReducer.name]:userReducer.reducer,
    [cartReducer.name]:cartReducer.reducer,
    
  },
  middleware: (defaultMiddleware) => defaultMiddleware().concat(middlewares),
});