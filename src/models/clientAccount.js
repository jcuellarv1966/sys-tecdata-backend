import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const clientAccountSchema = new mongoose.Schema({
    numberAccount: { type: String, required: true },
    accountType: { type: ObjectId, ref: "AccountType" },
    client: { type: ObjectId, ref: "Client" },
    razSocial: { type: String, required: true },
    worker: { type: ObjectId, ref: "Worker" },
    numberContract: { type: String },
    observations: { type: String },
    transactionsItems: [
        {
            accountTransactionType: { type: String, required: true },
            name: { type: String, required: true },
            slug: { type: String, required: true },
            numberAccount: { type: String, required: true },
            numberContract: { type: String, required: true },
            client: { type: String, required: true },
            razSocial: { type: String, required: true },
            description: { type: String, required: true },
            debitTransaction: { type: Number, required: true },
            creditTransaction: { type: Number, required: true },
            balance: { type: Number, required: true },
            debit_credit: {
                type: String,
                enum: ["Yes", "No"],
            },
            transactionDate: { type: Date, default: Date.now() },
            observations: { type: String, required: false },
        }
    ],
    debit: { type: Number, required: true },
    credit: { type: Number, required: true },
    countableBalance: { type: Number, required: true },
    withHoldings: { type: Number },
    cashBalance: { type: Number },
    openDate: { type: Date, default: Date.now() },
    lockedDate: { type: Date, default: Date.now() },
    unlockedDate: { type: Date, default: Date.now() },
    closedDate: { type: Date, default: Date.now() },
    current: {
        type: String,
        enum: ["Yes", "No"],
    },

}, { timestamps: true });

const clientAccount = mongoose.models.clientAccount || mongoose.model('clientAccount', clientAccountSchema);
export default clientAccount;