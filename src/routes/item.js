const {Router} = require('express');
const {check, validationResult} = require('express-validator');
const Collection = require("../models/Collection");
const Item = require("../models/Item");
const Tag = require("../models/Tag");
const Comment = require("../models/Comment");
const authMiddleware = require("../middlewares/auth");
const User = require("../models/User");
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

            // const test = async (tag) => {
            //     !!await Tag.findOne({tag})
            // };
            // const ttt = async (tags) => {
            //     await Tag.updateOne({_id: tags._id}, {$set: {count: tags.count + 1}})
            // }
            // const eee = async (tag) => {
            //     await Tag.create({tag})
            // }

            // tags.forEach(({tag}) => {
            //     if (test(tag)) {
            //         console.log(tag)
            //         return ttt(tags)
            //     } else {
            //         return eee(tag)
            //     }
            // })

            // let resa = await Tag.find();
            //
            // console.log(resa)


            const item = await Item.create({
                name,
                imgSrc,
                date: new Date().toLocaleString("en-US", {timeZone: "Europe/Minsk"})
            })
            await Collection.updateOne({_id: id}, {$push: {items: item}});
            return res.status(200).json({message: 'Item was created.'});
        } catch (error) {
            console.log(error)
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
            const item = await Item.findOne({_id: id}).populate("tags").populate("comments");
            return res.json({
                id: item._id,
                name: item.name,
                imgSrc: item.imgSrc,
                tags: item.tags,
                comments: item.comments
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

router.put(
    '/comment/:id',
    async (req, res) => {
        try {
            const {sender, comment} = req.body;
            const id = req.params.id;
            const comments = await Comment.create({
                comment,
                sender,
                date: new Date().toLocaleString("en-US", {timeZone: "Europe/Minsk"})
            })
            console.log(comments)
            await Item.updateOne({_id: id}, {$push: {comments: comments}});
            return res.status(200).json({message: 'Comment was created.'});
        } catch (error) {
            res.status(500).json({message: 'Create comment error', error});
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
