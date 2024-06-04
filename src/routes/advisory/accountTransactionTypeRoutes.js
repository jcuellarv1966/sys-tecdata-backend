import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import AccountTransactionType from "../../models/accountTransactionsTypes.js";

import { isAuth, isAdmin } from "../../utils.js";

const accountTransactionTypesRoutes = express.Router();

accountTransactionTypesRoutes.get(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const accountTransactionTypes = await AccountTransactionType.find()
            .sort({ name: 1 })
            .exec();
        res.send(accountTransactionTypes);
    })
);

accountTransactionTypesRoutes.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            const newAccountTransactionType = await new AccountTransactionType(req.body).save();
            res.json(newAccountTransactionType);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

accountTransactionTypesRoutes.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        console.log(req.body);
        const accountTransactionType = await AccountTransactionType.findById(req.params.id);

        if (accountTransactionType) {
            accountTransactionType.name = req.body.values.name;
            accountTransactionType.description = req.body.values.description;
            accountTransactionType.debit_credit = req.body.values.debit_credit;
            await accountTransactionType.save();
            res.send({ message: "Account Transaction Type updated successfully" });
        } else {
            res.status(404).send({ message: "Account Transaction Type not found" });
        }
    })
);

accountTransactionTypesRoutes.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const accountTransactionType = await AccountTransactionType.findById(req.params.id);

        if (accountTransactionType) {
            await accountTransactionType.remove();
            res.send({ message: "Account Transaction Type deleted successfully" });
        } else {
            res.status(404).send({ message: "Account Transaction Type not found" });
        }
    })
);

const PAGE_SIZE = 11;

accountTransactionTypesRoutes.get(
    "/admin",
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const accountTransactionTypes = await AccountTransactionType.find()
            .sort({ name: 1 })
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countAccountTransactionTypes = await AccountTransactionType.countDocuments();

        res.send({
            accountTransactionTypes,
            countAccountTransactionTypes,
            page,
            pages: Math.ceil(countAccountTransactionTypes / pageSize),
        });
    })
);

accountTransactionTypesRoutes.get(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const accountTransactionType = await AccountTransactionType.findById(req.params.id)
            .sort({ name: 1 })
            .exec();
        if (accountTransactionType) {
            res.send(accountTransactionType);
        } else {
            res.status(404).send({ message: 'Account Transaction Type Not Found' });
        }
    })
);

export default accountTransactionTypesRoutes;