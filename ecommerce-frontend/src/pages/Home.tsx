import { Link } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import cover from "../assets/images/cover.jpg"
import { useLatestProductsQuery } from "../redux/api/productApi"
import toast from "react-hot-toast"
import Skeleton from "../components/admin/Loader";
import { CartItem } from "../types/types"
import { useDispatch } from "react-redux"
import { addToCart } from "../redux/reducer/cartReducer"


const Home = () => {
  const {data, isLoading, isError} = useLatestProductsQuery("")
  console.log(data?.products)
  const dispatch = useDispatch()


  const addToCartHandler = (cartItem:CartItem)=>{
    if(cartItem.stock < 1) return toast.error("Out of stock")
    dispatch(addToCart(cartItem));
  toast.success("Added to cart");
  }

  if(isError) toast.error("There is Error loading App")

  return (
    <div className="home">
      <section>
        <img src={cover} alt="cover Photo" />
      </section>

      <h1>
        Latest Products
        <Link to="/search" className="findmore">
          More
        </Link>
      </h1>
      <main>
        {isLoading ? (
          <Skeleton />
        ) : (
           data?.products?.map((product) => (
            <ProductCard
              key={product._id}
              productId={product._id}
              name={product.name}
              price={product.price}
              stock={product.stock}
              handler={addToCartHandler}
              photo={product.photo}
            />
          ))
        )}
      </main>
    </div>
  );
}

export default Home