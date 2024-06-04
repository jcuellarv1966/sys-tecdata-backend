import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import ClientAccount from "../../models/clientAccount.js";

import { isAuth, isAdmin } from "../../utils.js";

const clientAccountsRoutes = express.Router();

clientAccountsRoutes.get(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientAccounts = await ClientAccount.find()
            .sort({ openDate: 1 })
            .populate('accountType', 'name')
            .populate('client', 'razSocial')
            .exec();
        res.send(clientAccounts);
    })
);

clientAccountsRoutes.post(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        try {
            console.log(req.body);
            const newClientAccount = await new ClientAccount(req.body).save();
            res.json(newClientAccount);
        } catch (err) {
            console.log(err);
            res.status(400).json({ err: err.message });
        }
    })
);

clientAccountsRoutes.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        console.log(req.body);
        const clientAccount = await ClientAccount.findById(req.params.id);

        if (clientAccount) {
            clientAccount.numberAccount = req.body.values.numberAccount;
            clientAccount.accountType = req.body.values.accountType;
            clientAccount.client = req.body.values.client;
            clientAccount.razSocial = req.body.values.razSocial;
            clientAccount.worker = req.body.values.worker;
            clientAccount.numberContract = req.body.values.numberContract;
            clientAccount.observations = req.body.values.observations;
            clientAccount.transactionsItems = req.body.values.transactionsItems;
            clientAccount.debit = req.body.values.debit;
            clientAccount.credit = req.body.values.account;
            clientAccount.countableBalance = req.body.values.countableBalance;
            clientAccount.withHoldings = req.body.values.withHoldings;
            clientAccount.cashBalance = req.body.values.cashBalance;
            clientAccount.openDate = req.body.values.openDate;
            clientAccount.lockedDate = req.body.values.lockedDate;
            clientAccount.unlockedDate = req.body.values.unlockedDate;
            clientAccount.closedDate = req.body.values.closedDate;
            clientAccount.current = req.body.values.current;
            await clientAccount.save();
            res.send({ message: "Client Account updated successfully" });
        } else {
            res.status(404).send({ message: "Client Account not found" });
        }
    })
);

clientAccountsRoutes.delete(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientAccount = await ClientAccount.findById(req.params.id);

        if (clientAccount) {
            await clientAccount.remove();
            res.send({ message: "Client Account deleted successfully" });
        } else {
            res.status(404).send({ message: "Client Account not found" });
        }
    })
);

const PAGE_SIZE = 11;

clientAccountsRoutes.get(
    "/admin",
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const accounts = await ClientAccount.find()
            .sort({ openDate: -1 })
            .populate('accountType', 'name')
            .populate('client', 'razSocial')
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        const countAccounts = await ClientAccount.countDocuments();

        res.send({
            accounts,
            countAccounts,
            page,
            pages: Math.ceil(countAccounts / pageSize),
        });
    })
);

clientAccountsRoutes.get(
    "/findbyclient/:id",
    expressAsyncHandler(async (req, res) => {
        const clientAccounts = await ClientAccount.find({ client: req.params.id })
            .sort({ openDate: 1 })
            .populate("accountType")
            .populate("client")
            .exec();

        if (clientAccounts.length > 0) {
            res.send(clientAccounts);
        } else {
            res.status(404).send({ message: "Client Accounts not found" });
        }
    })
);

clientAccountsRoutes.get(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const clientAccount = await ClientAccount.findById(req.params.id)
            .populate("accountType")
            .populate("client")
            .exec();
        if (clientAccount) {
            res.send(clientAccount);
        } else {
            res.status(404).send({ message: 'Client Account Not Found' });
        }
    })
);

export default clientAccountsRoutes;