import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useSelector } from "react-redux";
import { UserReducerInitialState } from "../../../types/reducer-types";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useDeleteProductMutation, useProductDetailsQuery, useUpdateProductMutation } from "../../../redux/api/productApi";
import { server } from "../../../redux/store";
import { responseToast } from "../../../utils/features";

const Productmanagement = () => {
  const { user } = useSelector(
    (state: { userReducer: UserReducerInitialState }) => state.userReducer
  );

    const navigate = useNavigate();
    const params = useParams();
    const {data,isError } = useProductDetailsQuery(params.id!)
    console.log(data)

    const { price, photo, name, stock, category } = data?.product || {
      photo: "",
      category: "",
      name: "",
      stock: 0,
      price: 0,
      _id: "",
    };

  const [priceUpdate, setPriceUpdate] = useState<number>(price);
  const [stockUpdate, setStockUpdate] = useState<number>(stock);
  const [nameUpdate, setNameUpdate] = useState<string>(name);
  const [categoryUpdate, setCategoryUpdate] = useState<string>(category);
  const [photoUpdate, setPhotoUpdate] = useState<string>(photo);
  const [photoFile, setPhotoFile] = useState<File>();

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0];

    const reader: FileReader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotoUpdate(reader.result);
          console.log("first")
          console.log(reader.result)
          setPhotoFile(file);
          console.log("photoUpdate",photoUpdate)
        }
      };
    }
  };
  const deleteHandler = async() => {
    const res = await deleteProduct({userId:user?._id!,productId:data?.product._id!})
    responseToast(res,navigate,"/admin/product")
  };


  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
   e.preventDefault();
   const formData = new FormData();

   if (nameUpdate) formData.append("name", nameUpdate);
   //console.log(nameUpdate);

   if (priceUpdate) formData.append("price", priceUpdate.toString());

   if (stockUpdate !== undefined)
     formData.append("stock", stockUpdate.toString());

   if (photoFile) formData.append("photo", photoFile); 

   if (categoryUpdate) formData.append("category", categoryUpdate);
   
    const res = await updateProduct({
      formData,
      userId: user?._id!,
      productId: data?.product._id!,
    });

    responseToast(res, navigate, "/admin/product");
  };

   if (isError) return <Navigate to={"/404"} />;

  useEffect( ()=>{
    if(data){
      setPriceUpdate(data.product.price);
      setStockUpdate(data.product.stock);
      setNameUpdate(data.product.name);
      setCategoryUpdate(data.product.category);
    }
  },[data])

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <section>
          <strong>ID - {data?.product._id}</strong>
          <img src={`${server}/${photo}`} alt="Product" />
          <p>{name}</p>
          {stock > 0 ? (
            <span className="green">{stock} Available</span>
          ) : (
            <span className="red"> Not Available</span>
          )}
          <h3>₹{price}</h3>
        </section>
        <article>
          <button className="product-delete-btn" onClick={deleteHandler}>
            <FaTrash />
          </button>
          <form onSubmit={submitHandler}>
            <h2>Manage</h2>
            <div>
              <label>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={nameUpdate}
                onChange={(e) => setNameUpdate(e.target.value)}
              />
            </div>
            <div>
              <label>Price</label>
              <input
                type="number"
                placeholder="Price"
                value={priceUpdate}
                onChange={(e) => setPriceUpdate(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Stock</label>
              <input
                type="number"
                placeholder="Stock"
                value={stockUpdate}
                onChange={(e) => setStockUpdate(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Category</label>
              <input
                type="text"
                placeholder="eg. laptop, camera etc"
                value={categoryUpdate}
                onChange={(e) => setCategoryUpdate(e.target.value)}
              />
            </div>

            <div>
              <label>Photo</label>
              <input type="file" onChange={changeImageHandler} />
            </div>

            {photoUpdate && <img src={photoUpdate} alt="New Image" />}
            <button type="submit">Update</button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default Productmanagement;
