import mongoose from "mongoose";

const productCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Name is required",
        minlength: [2, "Too short"],
        maxlength: [128, "Too long"],
        unique: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true,
    },
    images: { type: Array, },

}, { timestamps: true });

const ProductCategory = mongoose.models.ProductCategory || mongoose.model('ProductCategory', productCategorySchema);
export default ProductCategory;