import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import CartItem from "../components/CartItem";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CartReducerInitialState } from "../types/reducer-types";
import { calculatePrice, discountApplied } from "../redux/reducer/cartReducer";
import axios from "axios";
import { server } from "../redux/store";



const Cart = () => {
  const {cartItems,subtotal,tax,total,shippingCharges,discount}= useSelector((state:{cartReducer:CartReducerInitialState})=>state.cartReducer)
  const [couponCode, setCouponCode]= useState<string>("");
  const [isVaildCouponCode, setIsValidCoouponCode] = useState<boolean>(false);
const dispatch = useDispatch();


useEffect(()=>{
  const {token,cancel} = axios.CancelToken.source()

    const timeOutId = setTimeout( async()=>{
   await axios.post(`${server}/api/v1/payment/discount?coupon=${couponCode}`,{
    cancelToken:token
   }).then( (res)=>{
    dispatch(calculatePrice());
    dispatch(discountApplied(res.data.discount));
    console.log(res);
    setIsValidCoouponCode(true);
   })
   .catch( ()=>{
    dispatch(calculatePrice());
    dispatch(discountApplied(0));
    setIsValidCoouponCode(false)})
    },1000)

    return ()=>{
      clearTimeout(timeOutId);
       cancel();
      setIsValidCoouponCode(false);
     
    } 
  },[couponCode])

  useEffect( ()=>{
    dispatch(calculatePrice())
  },[cartItems])

  return (
    <div className="cart">
      <main>

{
  cartItems.length > 0 ? cartItems.map( (item,idx)=>(
    <CartItem
      key={idx}
      productId={item.productId}
      photo={item.photo}
      name={item.name}
      price={item.price}
      quantity={item.quantity}
      stock={item.stock}
    />
  )):
  (<h1>No item added</h1>)
}

      </main>
      <aside>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping Charges: ₹{shippingCharges}</p>
        <p>Tax: ₹{tax}</p>

        <p>
          Discount: <em>-₹{discount}</em>
        </p>
        <p>
          <b>Total: ₹ {total}</b>
        </p>
        <input
          type="text"
          placeholder="Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        {couponCode &&
          (isVaildCouponCode ? (
            <span className="green">
              ₹{discount} off using the <code>{couponCode}</code>
            </span>
          ) : (
            <span className="red">
              Invalid Coupon <VscError />
            </span>
          ))}

          {
            cartItems.length > 0 && <Link to={"/shipping"}>Checkout</Link>
          }
      </aside>
    </div>
  );
}

export default Cart