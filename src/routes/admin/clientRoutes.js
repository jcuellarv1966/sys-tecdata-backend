import express from "express";
import expressAsyncHandler from "express-async-handler";
import Client from "../../models/Client.js";
import { isAuth, isAdmin } from '../../utils.js';
import slugify from "slugify";
import multer from "multer";
import shortid from "shortid";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "../../uploads/clients"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const uploadImage = multer({ storage });

clientRouter.get("/", async (req, res) => {
  const clients = await Client.find().sort("razSocial");
  res.send(clients);
});

clientRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      console.log(req.body);
      req.body.slug = slugify(req.body.razSocial);
      const newClient = await new Client(req.body).save();
      res.json(newClient);
    } catch (err) {
      console.log(err);
      res.status(400).json({ err: err.message });
    }
  })
);

clientRouter.post(
  "/uploadimage",
  isAuth,
  isAdmin,
  uploadImage.single("clientImage"),
  expressAsyncHandler(async (req, res) => {
    let file = req.file.filename;
    res.status(200).json({ file });
  })
);

clientRouter.post(
  "/removeimage",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const DIR = 'uploads/clients';
    fs.unlinkSync(DIR + '/' + req.body.file);
    return res.status(200).send('Successfully! Image has been Deleted');
  })
);

clientRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    const clientId = req.params.id;
    req.body.slug = slugify(req.body.values.razSocial);
    const client = await Client.findById(clientId);

    if (client) {
      client.rut = req.body.values.rut;
      client.razSocial = req.body.values.razSocial;
      client.slug = req.body.slug;
      client.address = req.body.values.address;
      client.email = req.body.values.email;
      client.contactNumber = req.body.values.contactNumber;
      client.credit = req.body.values.credit;
      client.bornDate = req.body.values.bornDate;
      client.beginDate = req.body.values.beginDate;
      client.endDate = req.body.values.endDate;
      client.images = req.body.values.images;
      client.current = req.body.values.current;
      await client.save();
      res.send({ message: "Client updated successfully" });
    } else {
      res.status(404).send({ message: "Client not found" });
    }
  })
);

clientRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const client = await Client.findById(req.params.id);
    if (client) {
      await client.remove();
      res.send({ message: "Client Deleted" });
    } else {
      res.status(404).send({ message: "Client Not Found" });
    }
  })
);

const PAGE_SIZE = 11;

clientRouter.get(
  "/admin",
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const clients = await Client.find()
      .sort("razSocial")
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countClients = await Client.countDocuments();

    res.send({
      clients,
      countClients,
      page,
      pages: Math.ceil(countClients / pageSize),
    });
  })
);

clientRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const credit = query.credit || '';
    const current = query.current || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
          razSocial: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
        : {};

    const creditFilter =
      credit && credit !== 'all'
        ? {
          credit: {
            $gte: Number(credit.split(',')[0]),
            $lte: Number(credit.split(',')[1]),
          },
        }
        : {};

    const currentFilter =
      current && current !== 'all'
        ? { current }
        : {};

    const sortOrder =
      order === 'razSocialAsc'
        ? { razSocial: 1 }
        : order === 'razSocialDesc'
          ? { razSocial: -1 }
          : order === 'lowest'
            ? { credit: 1 }
            : order === 'highest'
              ? { credit: -1 }
              : order === 'newest'
                ? { beginDate: -1 }
                : { _id: -1 };

    const clients = await Client.find({
      ...queryFilter,
      ...creditFilter,
      ...currentFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countClients = await Client.countDocuments({
      ...queryFilter,
      ...creditFilter,
      ...currentFilter,
    });

    res.send({
      clients,
      countClients,
      page,
      pages: Math.ceil(countClients / pageSize),
    });
  })
);

clientRouter.get("/:id", async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (client) {
    res.send(client);
  } else {
    res.status(404).send({ message: "Client Not Found" });
  }
});

clientRouter.get("/slug/:slug", async (req, res) => {
  const client = await Client.findOne({ slug: req.params.slug });
  if (client) {
    res.send(client);
  } else {
    res.status(404).send({ message: "Client Not Found" });
  }
});

export default clientRouter;
