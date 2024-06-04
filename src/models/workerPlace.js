import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const workerPlaceSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        minlength: [3, "Demasiado corto.."],
        maxlength: [64, "Demasiado largo..."],
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true,
    },
    workerCategory: { type: ObjectId, ref: "WorkerCategory", required: true },
    basicSalary: { type: Number },
    bonifications: { type: Number },
    foodSupplier: { type: Number },
    movilizations: { type: Number },
    brutSalary: { type: Number },

}, { timestamps: true });

mongoose.models = {}

const WorkerPlace = mongoose.models.WorkerPlace || mongoose.model("WorkerPlace", workerPlaceSchema);
export default WorkerPlace;