import mongoose from "mongoose";

const clientContractClauseSchema = new mongoose.Schema({
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
    description: { type: String }

}, { timestamps: true });

const ClientContractClause = mongoose.models.ClientContractClause || mongoose.model('ClientContractClause', clientContractClauseSchema);
export default ClientContractClause;