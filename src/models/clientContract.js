import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const clientContractSchema = new mongoose.Schema({
    numberContract: { type: String },
    contractType: { type: ObjectId, ref: 'ClientContractType' },
    numberOrder: { type: String },
    numberProject: { type: String },
    client: { type: ObjectId, ref: "Client" },
    razSocial: { type: String },
    worker: { type: ObjectId, ref: "User" },
    observations: { type: String },
    contractItems: [
        {
            title: { type: String, required: true },
            slug: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
    subTotal: { type: Number, required: true },
    igv: { type: Number, required: true },
    total: { type: Number, required: true },
    charges: { type: Number },
    balanceOutstanding: { type: Number },
    contractClauses: [
        {
            name: { type: String, required: true },
            slug: { type: String, required: true },
            description: { type: String, required: true },
            observations: { type: String, required: false },
        }
    ],
    signedDate: { type: Date, default: Date.now() },
    beginDate: { type: Date, default: Date.now() },
    endDate: { type: Date, default: Date.now() },
    rescindedDate: { type: Date, default: Date.now() },
    cash_credit: {
        type: String,
        enum: ["Yes", "No"],
    },
    isValid: {
        type: String,
        enum: ["Yes", "No"],
    },
    finished: {
        type: String,
        enum: ["Yes", "No"],
    },

}, { timestamps: true });

const clientContract = mongoose.models.clientContract || mongoose.model('clientContract', clientContractSchema);
export default clientContract;