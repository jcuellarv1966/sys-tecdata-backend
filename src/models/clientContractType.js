import mongoose from "mongoose";

const clientContractTypeSchema = new mongoose.Schema({
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

}, { timestamps: true });

const ClientContractType = mongoose.models.ClientContractType || mongoose.model('ClientContractType', clientContractTypeSchema);
export default ClientContractType;