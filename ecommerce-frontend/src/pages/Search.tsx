import { useState } from "react"
import ProductCard from "../components/ProductCard";
import { useCategoriesQuery, useSearchAllProductsQuery } from "../redux/api/productApi";
import toast from "react-hot-toast";
import { CustomError } from "../types/api-types";
import { Skelton } from "../components/Loader";
import { CartItem } from "../types/types";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/reducer/cartReducer";


const Search = () => {
  const {data:categoriesREsponse,isLoading:loadingCategories,isError,error} = useCategoriesQuery("")
  const dispatch = useDispatch();
  if(isError){
   toast.error((error as CustomError).data.message)
  }

  const [search,setSearch] = useState("");
  const [sort,setSort] = useState("");
  const [maxPrice,setMaxPrice] = useState<number>();
  const [category,setCategory] = useState("");
  const [page,setPage] = useState<number>(1);
  const {
    data: searchedData,
    isLoading: productLoading,
    isError: productIsError,
    error: productError,
  } = useSearchAllProductsQuery({
    search,
    sort,
    category,
    page,
    price: maxPrice!,
  });
 

  const addToCartHandler = (cartItem:CartItem)=>{
    if(cartItem.stock < 1){
      return toast.error("Out of stock")
    }
    dispatch(addToCart(cartItem))
    toast.success("Added to cart")
  }
console.log(searchedData?.products);

  if(productIsError){
    const err = productError as CustomError;
    toast.error(err.data.message)
  }

  const [isNextPage,setIsNextPage] = useState(false);
  const [isPrevPage,setIsPrevPage] = useState(false);

  return (
    <div className="product-search-page">
      <aside>
        <h2>Filter</h2>
        <div>
          <h4>Sort</h4>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">All</option>
            <option value="dsc">Price(High to Low)</option>
            <option value="asc">Price(Low to High)</option>
          </select>
        </div>
        <div>
          <h4>Max Price: {maxPrice || ""}</h4>
          <input
            type="range"
            min={100}
            max={1000000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <h4>Category</h4>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {!loadingCategories &&
              categoriesREsponse?.categories.map((i) => (
                <option key={i} value={i}>
                  {i.toUpperCase()}
                </option>
              ))}
          </select>
        </div>
      </aside>

      <main>
        <h1>Products</h1>
        <input
          type="text"
          placeholder="Search By name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {productLoading ? (
          <Skelton count={25}/>
        ) : (
          <div className="search-product-list">
            {searchedData?.products.map((i) => (
              <ProductCard
                key={i._id}
                productId={i._id}
                name={i.name}
                price={i.price}
                stock={i.stock}
                photo={i.photo}
                handler={addToCartHandler}
              />
            ))}
          </div>
        )}

        {searchedData && searchedData.totalPages > 1 && (
          <article>
            <button
              disabled={!isPrevPage}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <span>
              {page} of {searchedData.totalPages}
            </span>
            <button
              disabled={!isNextPage}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </article>
        )}
      </main>
    </div>
  );
}

export default Search