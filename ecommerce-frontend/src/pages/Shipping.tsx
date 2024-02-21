import { ChangeEvent, useEffect, useState } from "react"
import { BiArrowBack } from "react-icons/bi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { CartReducerInitialState } from "../types/reducer-types"
import { server } from "../redux/store"
import axios from "axios"
import toast from "react-hot-toast"
import { saviShippingInfo } from "../redux/reducer/cartReducer"

const Shipping = () => {

    const {cartItems, total} = useSelector((state:{cartReducer:CartReducerInitialState})=>state.cartReducer)


    const [shippingInfo,setShippingInfo] = useState({
        address:"",
        city:"",
        state:"",
        country:"",
        pinCode:0,
    })

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeHandler = (e:ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
        setShippingInfo((prev)=>({...prev,
            [e.target.name]:e.target.value}))
    }

      const submitHandler = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        dispatch(saviShippingInfo(shippingInfo))
        try {
          const {data} = await axios.post(`${server}/api/v1/payment/create`,{amount:total},{headers:{"Content-Type":"application/json"}})
          console.log(data)
          navigate("/pay",{
            state:data.clientSecret
          })
        } catch (error) {
          toast.error("Something went wrong")
        }
      }


    useEffect(()=>{
      if (cartItems.length <= 0) return navigate("/cart");
    },[cartItems])

  return (
    <div className="shipping">
      <button className="back-btn" onClick={()=>navigate("/cart")}>
        <BiArrowBack />
      </button>

      <form onSubmit={submitHandler}>
        <h1>Shipping Address</h1>
        <input
          type="text"
          placeholder="Address"
          name="address"
          value={shippingInfo.address}
          required
          onChange={changeHandler}
        />

        <input
          type="text"
          placeholder="City"
          name="city"
          value={shippingInfo.city}
          required
          onChange={changeHandler}
        />

        <input
          type="text"
          placeholder="State"
          name="state"
          value={shippingInfo.state}
          required
          onChange={changeHandler}
        />

        <select
          name="country"
          required
          value={shippingInfo.country}
          onChange={changeHandler}
        >
          <option value="">Choose Country</option>
          <option value="india">India</option>
          <option value="russia">Russia</option>
          <option value="usa">Usa</option>
          <option value="iteli">Iteli</option>
        </select>

        <input
          type="number"
          placeholder="Pin Code"
          name="pinCode"
          value={shippingInfo.pinCode}
          required
          onChange={changeHandler}
        />
        <button type="submit">Pay Now</button>
      </form>
    </div>
  );
}

export default Shipping