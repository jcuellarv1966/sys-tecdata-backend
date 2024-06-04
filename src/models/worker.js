import mongoose from "mongoose";
// import { workerCategorySchema } from "./WorkerCategory.js";
// mongoose.model('WorkerCategory', workerCategorySchema);

const workerSchema = new mongoose.Schema({
    dni: { type: String, trim: true, required: false, unique: true, minlength: 8, maxlength: 8 },
    rut: { type: String, trim: true, required: false, unique: true, minlength: 11, maxlength: 11 },
    firstName: { type: String, trim: true, required: false, minlength: 3, maxlength: 64 },
    lastName: { type: String, trim: true, required: false, minlength: 3, maxlength: 64 },
    address: { type: String, trim: true, required: false },
    email: { type: String, required: false, trim: true, unique: true, lowercase: true, },
    contactNumber: { type: String, required: false, minlength: 12, maxlength: 12 },
    images: { type: Array },
    /* image: { type: String, required: false }, */
    workerCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerCategory', required: false },
    workerPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerPlace', required: false },
    basicSalary: { type: Number, required: true },
    bonifications: { type: Number },
    foodSupplier: { type: Number },
    movilizations: { type: Number },
    brutSalary: { type: Number },
    discountESSALUD: { type: Number },
    discountFONASA: { type: Number },
    discountAFP: { type: Number },
    totalDiscounts: { type: Number },
    percentDiscountESSALUD: { type: Number },
    percentDiscountFONASA: { type: Number },
    percentDiscountAFP: { type: Number },
    netSalary: { type: Number },
    bornDate: { type: Date, default: Date.now() },
    beginDate: { type: Date, default: Date.now() },
    endDate: { type: Date, default: Date.now() },
}, { timestamps: true });

const Worker = mongoose.models.Worker || mongoose.model("Worker", workerSchema);
export default Worker;