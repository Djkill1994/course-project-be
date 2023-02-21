const {Router} = require('express');
const {check, validationResult} = require('express-validator');
const Collection = require("../models/Collection");
const Item = require("../models/Item");
const Tag = require("../models/Tag");
const authMiddleware = require("../middlewares/auth");
const router = Router();

router.put(
    '/:id', [check('name').isLength({min: 1})],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'The data provided during item creation is incorrect.',
                    errors: errors.array(),
                });
            }
            const {name, imgSrc, tags} = req.body;
            const id = req.params.id;
            const tag = await Tag.create({
                tag: tags
            })
            const item = await Item.create({
                name,
                imgSrc,
                tags: tag,
                date: new Date().toLocaleString("en-US", {timeZone: "Europe/Minsk"})
            })
            console.log(item)
            await Collection.updateOne({_id: id}, {$push: {items: item}});
            return res.status(200).json({message: 'Item was created.'});
        } catch (error) {
            res.status(500).json({message: 'Create my item error', error});
        }
    }
);
// todo придумать как получпть юзера публикации, перенести в коллекцию роут, реализовать получение тэгов
router.get(
    '/all/:id',
    async (req, res) => {
        try {
            const id = req.params.id;
            const items = await Collection.findOne({_id: id}, ["items"]).populate("items");
            return res.json(items.items.map((item) => ({
                id: item._id,
                name: item.name,
                imgSrc: item.imgSrc,
                tags: item.tags,
            })));
        } catch (error) {
            res.status(500).json({message: 'Get my items error', error});
        }
    }
);

router.get(
    '/all',
    async (req, res) => {
        try {
            const items = await Item.find();
            return res.json(items.map((item) => ({
                id: item._id,
                name: item.name,
                imgSrc: item.imgSrc,
                tags: item.tags,
            })));
        } catch (error) {
            res.status(500).json({message: 'Get my items error', error});
        }
    }
);

router.get(
    '/:id',
    async (req, res) => {
        try {
            const id = req.params.id;
            const item = await Item.findOne({_id: id});
            return res.json({
                id: item._id,
                name: item.name,
                imgSrc: item.imgSrc,
                tags: item.tags,
            });
        } catch (error) {
            res.status(500).json({message: 'Get my item error', error});
        }
    }
);

router.get(
    '/tag/all',
    async (req, res) => {
        try {
            const tags = await Tag.find();
            return res.json(tags.map((tag) => ({
                id: tag._id,
                tag: tag.tag,
            })));
        } catch (error) {
            res.status(500).json({message: 'Get tags error', error});
        }
    }
);

router.delete('/', authMiddleware, async (req, res) => {
    try {
        const {id} = req.body;
        await Item.deleteOne({_id: id});
        res.status(200).json({message: 'Item has been deleted.'});
    } catch (error) {
        res.status(500).json({message: 'Delete item error', error});
    }
})

module.exports = router;
