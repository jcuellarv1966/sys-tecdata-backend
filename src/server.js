import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import productRouter from "./routes/admin/productRoutes.js";
import productCategoryRouter from "./routes/admin/productCategoryRoutes.js";
import orderRouter from './routes/admin/orderRoutes.js';
import clientRouter from "./routes/admin/clientRoutes.js";
import providerRouter from "./routes/admin/providerRoutes.js";
import partnerRouter from "./routes/admin/partnerRoutes.js";
import workerRouter from "./routes/admin/workerRoutes.js";
import workerCategoryRouter from "./routes/admin/workerCategoryRoutes.js";
import workerPlaceRouter from "./routes/admin/workerPlaceRoutes.js";
import userRouter from "./routes/admin/userRoutes.js";

import summaryRouter from "./routes/advisory/summaryRoutes.js";
import clientProformsRoutes from "./routes/advisory/clientProformRoutes.js";
import clientContractsRoutes from "./routes/advisory/clientContractRoutes.js";
import clientContractTypesRoutes from "./routes/advisory/clientContractTypeRoutes.js";
import clientContractClausesRoutes from "./routes/advisory/clientContractClauseRoutes.js";
import clientAccountRoutes from "./routes/advisory/clientAccountRoutes.js";
import accountTypesRoutes from "./routes/advisory/accountTypeRoutes.js";
import accountTransactionTypesRoutes from "./routes/advisory/accountTransactionTypeRoutes.js";

mongoose.set("strictQuery", true);
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err.message);
    });

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/keys/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use("/public/products", express.static(path.join(__dirname, "../uploads/products")));
app.use("/public/productscategories", express.static(path.join(__dirname, "../uploads/productscategories")));
app.use("/public/clients", express.static(path.join(__dirname, "../uploads/clients")));
app.use("/public/providers", express.static(path.join(__dirname, "../uploads/providers")));
app.use("/public/partners", express.static(path.join(__dirname, "../uploads/partners")));
app.use("/public/workers", express.static(path.join(__dirname, "../uploads/workers")));

app.use("/api/products", productRouter);
app.use("/api/productscategories", productCategoryRouter);
app.use('/api/orders', orderRouter);
app.use("/api/clients", clientRouter);
app.use("/api/providers", providerRouter);
app.use("/api/partners", partnerRouter);
app.use('/api/workers', workerRouter);
app.use("/api/workerscategories", workerCategoryRouter);
app.use("/api/workersplaces", workerPlaceRouter);
app.use("/api/users", userRouter);

app.use("/api/summaries", summaryRouter);
app.use("/api/clientproforms", clientProformsRoutes);
app.use("/api/clientcontracts", clientContractsRoutes);
app.use("/api/clientcontracttypes", clientContractTypesRoutes);
app.use("/api/clientcontractclauses", clientContractClausesRoutes);
app.use("/api/clientaccounts", clientAccountRoutes);
app.use("/api/accounttypes", accountTypesRoutes);
app.use("/api/accounttransactiontypes", accountTransactionTypesRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`serve at http://localhost:${port}`);
});