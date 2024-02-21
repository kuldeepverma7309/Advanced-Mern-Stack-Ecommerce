import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { NewOrderRequest } from "../types/api-types";
import { useDispatch, useSelector } from "react-redux";
import { CartReducerInitialState, UserReducerInitialState } from "../types/reducer-types";
import { useNewOrderMutation } from "../redux/api/orderApi";
import { resetCart } from "../redux/reducer/cartReducer";
import { responseToast } from "../utils/features";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PROMISE);

const CheckOutForm = ()=>{
    const { user } = useSelector(
      (state: { userReducer: UserReducerInitialState }) => state.userReducer
    );

    const {
      shippingInfo,
      shippingCharges,
      cartItems,
      subtotal,
      tax,
      discount,
      total,
    } = useSelector(
      (state: { cartReducer: CartReducerInitialState }) => state.cartReducer
    );

    const [newOrder] = useNewOrderMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const stripe = useStripe();
    const elements = useElements();


    const [isProcessing,setIsProcessing] = useState<boolean>(false)

    const submitHandler = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!stripe || !elements) return;
        setIsProcessing(true);


        const orderData:NewOrderRequest = {
            shippingInfo,
            shippingCharges,
            subtotal,
            tax,
            discount,
            total,
            user:user?._id!,
            orderItems:cartItems
        };

       const {paymentIntent,error} =  await stripe.confirmPayment({elements,confirmParams:{return_url:window.location.origin},
        redirect:"if_required"})

        if(error) {
            setIsProcessing(false);
            return toast.error(error.message || "Something went wrong");
        }

        if(paymentIntent.status === "succeeded"){
            const res = await newOrder(orderData);
            dispatch(resetCart());
            responseToast(res,navigate,"/orders")
        }

         setIsProcessing(false);

    };
    return(
        <div className="checkout-container">
            <form onSubmit={submitHandler}>
                <PaymentElement/>
                <button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Processing...":"Pay"}
                </button>
            </form>
        </div>
    )
}

const CheckOut = () => {
    const location = useLocation();
    const clientSecret:string | undefined = location.state;
    if(!clientSecret) return <Navigate to={"/shipping"}/>;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret:clientSecret
      }}
    >
      <CheckOutForm />
    </Elements>
  );
}

export default CheckOut