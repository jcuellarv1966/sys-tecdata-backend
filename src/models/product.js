import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
    title: { type: String, trim: true, required: true, maxlength: 256, text: true, },
    slug: { type: String, unique: true, lowercase: false, index: true, },
    description: { type: String, required: true, maxlength: 2048, text: true, },
    cost: { type: Number, required: false, },
    price: { type: Number, required: true, },
    countInStock: { type: Number },
    category: { type: ObjectId, ref: "ProductCategory", },
    subs: [
        {
            type: ObjectId,
            ref: "ProductSubCategory",
        },
    ],
    brand: { type: String },
    images: { type: Array, },
    sold: { type: Number, default: 0, },
    rating: { type: Number, required: true },
    ratings: [
        {
            star: Number,
            postedBy: { type: ObjectId, ref: "Client" },
        },
    ],
}, { timestamps: true });

const Product =
    mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;