import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import clientProform from "../../models/clientProform.js";
import clientContract from "../../models/clientContract.js";
import clientAccount from "../../models/clientAccount.js";
import Project from "../../models/project.js";
import clientPay from "../../models/clientPay.js";

import { isAuth, isAdmin } from '../../utils.js';

const summaryRouter = express.Router();

summaryRouter.get(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const clientProforms = await clientProform.aggregate([
            {
                $group: {
                    _id: null,
                    numClientProforms: { $sum: 1 },
                },
            },
        ]);

        const clientContracts = await clientContract.aggregate([
            {
                $group: {
                    _id: null,
                    numClientContracts: { $sum: 1 },
                },
            },
        ]);

        const clientAccounts = await clientAccount.aggregate([
            {
                $group: {
                    _id: null,
                    numClientAccounts: { $sum: 1 },
                },
            },
        ]);

        const Projects = await Project.aggregate([
            {
                $group: {
                    _id: null,
                    numProjects: { $sum: 1 },
                },
            },
        ]);

        const clientPays = await clientPay.aggregate([
            {
                $group: {
                    _id: null,
                    numClientPays: { $sum: 1 },
                },
            },
        ]);

        res.send({
            clientProforms, clientContracts, clientAccounts, Projects, clientPays
        });
    })
);

export default summaryRouter;