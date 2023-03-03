const {Router} = require('express');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Collection = require("../models/Collection");
const Item = require("../models/Item");
const authMiddleware = require("../middlewares/auth");
const Theme = require("../models/Theme");
const router = Router();

router.put(
  '/',
  [
    check('description').isLength({min: 1}),
    check('name').isLength({min: 1}),
    check('theme').isLength({min: 1}),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'The data provided during collection creation is incorrect.',
          errors: errors.array(),
        });
      }

      const currentUser = await User.findOne({_id: jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET).userId});
      const {name, theme, description, imgSrc, optionalFields} = req.body;
      const collection = await Collection.create({
        name,
        theme,
        optionalFields,
        description,
        imgSrc,
        date: new Date().toLocaleString("en-US", {timeZone: "Europe/Minsk"})
      });
      await User.updateOne({_id: currentUser}, {$push: {collections: collection}});
      return res.status(200).json({message: 'Collection was created.'});
    } catch (error) {
      res.status(500).json({message: 'Create my collection error', error});
    }
  }
);

router.get(
  '/themes',
  async (req, res) => {
    try {
      const themes = await Theme.find();
      return res.json(themes.map((theme) => ({
        id: theme._id,
        theme: theme.theme
      })));
    } catch (error) {
      res.status(500).json({message: 'Get themes error', error});
    }
  }
);

router.get(
  '/:userId',
  async (req, res) => {
    try {
      const currentUser = await User.findOne({_id: req.params.userId}).populate("collections");
      const userCollections = currentUser.collections;
      return res.json(userCollections.map((collection) => ({
        id: collection._id,
        name: collection.name,
        imgSrc: collection.imgSrc,
        description: collection.description,
        theme: collection.theme,
        date: collection.date,
      })));
    } catch (error) {
      res.status(500).json({message: 'Get my collections error', error});
    }
  }
);

router.get(
  '/one/:id',
  async (req, res) => {
    try {
      const id = req.params.id;
      const collection = await Collection.findOne({_id: id}).populate({
        path: "items",
        populate: [{path: "tags", model: "Tag"}]
      });

      return res.json({
        id: collection._id,
        name: collection.name,
        fields: collection.fields,
        optionalFields: collection.optionalFields,
        imgSrc: collection.imgSrc,
        description: collection.description,
        theme: collection.theme,
        date: collection.date,
        items: collection.items.map((item) => ({
          id: item._id,
          name: item.name,
          optionalFields: item.optionalFields,
          imgSrc: item.imgSrc,
          tags: item.tags.map(({_id, tag}) => {
            return {id: _id, tag: tag}
          }),
        })),
      });
    } catch (error) {
      res.status(500).json({message: 'Get my collection error', error});
    }
  }
);

router.get(
  '/all/collection',
  async (req, res) => {
    try {
      const collections = await Collection.find().populate("items");
      return res.json(collections.map((collection) => ({
        id: collection._id,
        name: collection.name,
        imgSrc: collection.imgSrc,
        description: collection.description,
        theme: collection.theme,
        date: collection.date,
        items: collection.items
      })).sort((a, b) => b.items.length - a.items.length).slice(0, 10));
    } catch (error) {
      res.status(500).json({message: 'Get collections error', error});
    }
  }
);

router.put('/settings/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const {name, optionalFields, imgSrc, description, theme} = req.body;
    await Collection.updateMany({_id: id}, {
      $set: {
        name: name,
        optionalFields: optionalFields,
        imgSrc: imgSrc,
        description: description,
        theme: theme
      }
    });

    res.status(200).json({message: 'You have update an collection settings.'});
  } catch (error) {
    res.status(500).json({message: 'Update collection settings error', error});
  }
});

router.delete('/', authMiddleware, async (req, res) => {
  try {
    const {id} = req.body;
    const collection = await Collection.findOne({_id: id}).populate({path: "items"});
    await Item.deleteMany({_id: collection.items.map(({_id}) => _id)});
    await Collection.deleteOne({_id: id});
    res.status(200).json({message: 'Collection has been deleted.'});
  } catch (error) {
    res.status(500).json({message: 'Delete collection error', error});
  }
});

module.exports = router;
