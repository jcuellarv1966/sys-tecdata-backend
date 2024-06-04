import mongoose from "mongoose";

const workerCategorySchema = new mongoose.Schema({

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
}, { timestamps: true });

const WorkerCategory = mongoose.models.WorkerCategory || mongoose.model("WorkerCategory", workerCategorySchema);
export default WorkerCategory;