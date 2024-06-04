import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
    {
        rut: { type: String, trim: true, required: false, unique: true, minlength: 11, maxlength: 11 },
        razSocial: { type: String, trim: true, required: true, unique: true },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            index: true,
        },
        address: { type: String, trim: true, required: true },
        email: { type: String, required: true, trim: true, unique: true, lowercase: true, },
        contactNumber: { type: String },
        credit: { type: Number },
        image: { type: String, required: false },
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

const Partner = mongoose.models.Partner || mongoose.model('Partner', partnerSchema);
export default Partner;