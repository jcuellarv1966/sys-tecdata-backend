import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const projectSchema = new mongoose.Schema({});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default Project;