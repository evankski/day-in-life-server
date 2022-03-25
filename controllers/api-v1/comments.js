const express = require('express')
const router = express.Router()
const db = require('../../models')
const requiresToken = require('./requiresToken')

router.post('/', async (req, res) => {
    try {
        const foundUser = await db.User.findOne({
            'photos._id': req.body.photoId,
        })
        console.log(foundUser)
        const foundPhoto = foundUser.photos.id(req.body.photoId)
        console.log(foundPhoto)
        foundPhoto.comments.push(req.body)
        await foundUser.save()
        res.status(201).json(foundUser)
    } catch (err) {
        console.log(err)
        res.status(503).json({ msg: 'database or server error'})
    }
})

router.put('/:id', requiresToken, async (req, res) => {
    try {
        if(req.body.photoId === res.locals.user.id) {

        }
    } catch (err) {
        console.log(err)
    }
})

router.delete('/:id', requiresToken, async (req, res) => {
    try {

    } catch (err) {
        console.log(err)
    }
})

module.exports = router