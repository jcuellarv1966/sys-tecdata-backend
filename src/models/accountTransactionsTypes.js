import mongoose from "mongoose";

const accountTransactionTypeSchema = new mongoose.Schema({
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
    description: { type: String },
    debit_credit: {
        type: String,
        enum: ["Yes", "No"],
    },

}, { timestamps: true });

const AccountTransactionType = mongoose.models.AccountTransactionType || mongoose.model('AccountTransactionType', accountTransactionTypeSchema);
export default AccountTransactionType;