import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema(
    {
        rut: { type: String, trim: true, required: false, unique: true, minlength: 11, maxlength: 11 },
        razSocial: { type: String, trim: false, required: false, unique: false },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            index: true,
        },
        address: { type: String, trim: true, required: false },
        email: { type: String, required: true, trim: true, unique: true, lowercase: true, },
        contactNumber: { type: String },
        credit: { type: Number },
        bornDate: { type: Date, default: Date.now() },
        beginDate: { type: Date, default: Date.now() },
        endDate: { type: Date, default: Date.now() },
        images: { type: Array },
        current: {
            type: String,
            enum: ["Yes", "No"],
        }
    },
    {
        timestamps: true,
    }
);

const Provider = mongoose.models.Provider || mongoose.model('Provider', providerSchema);
export default Provider;