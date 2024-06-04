import mongoose from "mongoose";

const accountTypeSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },

}, { timestamps: true });

const AccountType = mongoose.models.AccountType || mongoose.model('AccountType', accountTypeSchema);
export default AccountType;