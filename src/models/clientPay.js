import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const clientPaySchema = new mongoose.Schema({
    client: { type: ObjectId, ref: "Client" },
    sale: { type: ObjectId, ref: "Sale" },
    ammount: { type: Number, required: true },
    payDate: { type: Date, default: Date.now() },

}, { timestamps: true });

clientPaySchema.virtual('_payDate')
    .get(function () {
        return this.payDate.toISOString().substring(0, 10);
    });

const clientPay = mongoose.models.clientPay || mongoose.model('clientPay', clientPaySchema);
export default clientPay;