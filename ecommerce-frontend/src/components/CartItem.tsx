import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom"
import { server } from "../redux/store";
import { CartItem } from "../types/types";
import { useDispatch } from "react-redux";
import { addToCart, removeCartItem } from "../redux/reducer/cartReducer";
import toast from "react-hot-toast";


type CartItemProp = {
    productId:string,
    photo:string,
    name:string,
    price:number,
    quantity:number,
    stock:number,
}

const CartItem = ({
  photo,
  productId,
  name,
  price,
  quantity,
  stock,
}: CartItemProp) => {
  const dispatch = useDispatch();

  const addToCardHandler = (item:CartItem)=>{
    if(item.quantity >= item.stock){
      toast.error("Out of stock")
      return
    } 
    dispatch(addToCart({...item,quantity:item.quantity + 1}))
  }

  const decrementToCardHandler = (item:CartItem)=>{
    if(item.quantity <= 1) {
      toast.error("Only one item left")
      return;
    }
    dispatch(addToCart({...item,quantity:item.quantity-1}))
  }

  return (
    <div className="cart-item">
      <img src={`${server}/${photo}`} alt="Cart Item" />
      <article>
        <Link to={`${server}/${photo}`}>{name}</Link>
        <span>₹{price}</span>
      </article>
      <div>
        <button
          onClick={() =>
            decrementToCardHandler({
              photo,
              productId,
              name,
              price,
              quantity,
              stock,
            })
          }
        >
          -
        </button>
        <p>{quantity}</p>
        <button
          onClick={() =>
            addToCardHandler({ photo, productId, name, price, quantity, stock })
          }
        >
          +
        </button>
      </div>

      <button onClick={() => dispatch(removeCartItem(productId))}>
        <FaTrash />
      </button>
    </div>
  );
};

export default CartItem