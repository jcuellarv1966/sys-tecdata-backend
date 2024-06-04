const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Name is required",
        minlength: [2, "Too short"],
        maxlength: [128, "Too long"],
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true,
    },
    parent: { type: ObjectId, ref: "ProductCategory", required: true },
    images: { type: Array, },

}, { timestamps: true });

module.exports = mongoose.model('ProductSubCategory', productSubCategorySchema);