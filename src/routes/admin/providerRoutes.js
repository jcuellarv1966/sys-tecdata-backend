import express from "express";
import expressAsyncHandler from "express-async-handler";
import Provider from "../../models/Provider.js";
import { isAuth, isAdmin } from '../../utils.js';
import slugify from "slugify";
import multer from "multer";
import shortid from "shortid";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const providerRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "../../uploads/providers"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const uploadImage = multer({ storage });

providerRouter.get("/", async (req, res) => {
  const providers = await Provider.find().sort("razSocial");
  res.send(providers);
});

providerRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      console.log(req.body);
      req.body.slug = slugify(req.body.razSocial);
      const newProvider = await new Provider(req.body).save();
      res.json(newProvider);
    } catch (err) {
      console.log(err);
      res.status(400).json({ err: err.message });
    }
  })
);

providerRouter.post(
  "/uploadimage",
  isAuth,
  isAdmin,
  uploadImage.single("providerImage"),
  expressAsyncHandler(async (req, res) => {
    let file = req.file.filename;
    res.status(200).json({ file });
  })
);

providerRouter.post(
  "/removeimage",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const DIR = 'uploads/providers';
    fs.unlinkSync(DIR + '/' + req.body.file);
    return res.status(200).send('Successfully! Image has been Deleted');
  })
);

providerRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    const providerId = req.params.id;
    req.body.slug = slugify(req.body.values.razSocial);
    const provider = await Provider.findById(providerId);

    if (provider) {
      provider.rut = req.body.values.rut;
      provider.razSocial = req.body.values.razSocial;
      provider.slug = req.body.slug;
      provider.address = req.body.values.address;
      provider.email = req.body.values.email;
      provider.contactNumber = req.body.values.contactNumber;
      provider.credit = req.body.values.credit;
      provider.bornDate = req.body.values.bornDate;
      provider.beginDate = req.body.values.beginDate;
      provider.endDate = req.body.values.endDate;
      provider.images = req.body.values.images;
      provider.current = req.body.values.current;
      await provider.save();
      res.send({ message: "Provider updated successfully" });
    } else {
      res.status(404).send({ message: "Provider not found" });
    }
  })
);

providerRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const provider = await Provider.findById(req.params.id);
    if (provider) {
      await provider.remove();
      res.send({ message: "Provider Deleted" });
    } else {
      res.status(404).send({ message: "Provider Not Found" });
    }
  })
);

const PAGE_SIZE = 11;

providerRouter.get(
  "/admin",
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const providers = await Provider.find()
      .sort("razSocial")
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProviders = await Provider.countDocuments();

    res.send({
      providers,
      countProviders,
      page,
      pages: Math.ceil(countProviders / pageSize),
    });
  })
);

providerRouter.get(
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

    const providers = await Provider.find({
      ...queryFilter,
      ...creditFilter,
      ...currentFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProviders = await Provider.countDocuments({
      ...queryFilter,
      ...creditFilter,
      ...currentFilter,
    });

    res.send({
      providers,
      countProviders,
      page,
      pages: Math.ceil(countProviders / pageSize),
    });
  })
);

providerRouter.get("/:id", async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (provider) {
    res.send(provider);
  } else {
    res.status(404).send({ message: "Provider Not Found" });
  }
});

providerRouter.get("/slug/:slug", async (req, res) => {
  const provider = await Provider.findOne({ slug: req.params.slug });
  if (provider) {
    res.send(provider);
  } else {
    res.status(404).send({ message: "Provider Not Found" });
  }
});

export default providerRouter;
