// import { Router } from 'express'
import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'

// const actionRouter = Router()
const prisma = new PrismaClient()

export const LikePost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const body = req.body
    if (!helper.isValidatePaylod(body, ['post_id', 'action'])) {
        return res
            .status(200)
            .send({ status: 200, error: 'Invalid payload', error_description: 'post_id, action is required.' })
    }
    const { post_id, action } = req.body // action 1 => like, 2 => dislike
    if (Number.isNaN(Number(post_id) || Number.isNaN(Number(action)))) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'post_id should be a number.' })
    }
    const isAlreadyLiked = await prisma.likes.findFirst({ where: { post_id: post_id, user_id: req.user.id } })
    if (Number(action) === 1) {
        try {
            // creating new like entry then updating the likes count
            if (isAlreadyLiked) {
                return res
                    .status(200)
                    .send({ status: 400, error: 'Bad Request', error_description: 'Already liked this post' })
            }
            await prisma.likes.create({ data: { post_id: post_id, user_id: req.user.id } })
            const post = await prisma.post.update({ where: { id: post_id }, data: { likes: { increment: 1 } } })
            return res.status(200).send({ status: 200, message: 'Ok', post: post })
        } catch (err: unknown) {
            return res.status(200).send({ status: 404, error: 'Not found', error_description: 'Post not found.' })
        }
    } else {
        if (!isAlreadyLiked) {
            return res
                .status(200)
                .send({ status: 400, error: 'Bad Request', error_description: 'No like found for this from this user' })
        }
        const post = await prisma.post.update({ where: { id: post_id }, data: { likes: { decrement: 1 } } })
        const deletedPost = await prisma.likes.deleteMany({ where: { post_id: post_id, user_id: req.user.id } })
        return res.status(200).send({ status: 200, message: 'Ok', post: post })
    }
}
export const CommentPost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const body = req.body
    if (!helper.isValidatePaylod(body, ['post_id', 'comment'])) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'post_id, comment is required.' })
    }
    let { post_id, comment } = req.body
    if (Number.isNaN(Number(post_id))) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'post_id should be a number.' })
    }
    post_id = Number(post_id)
    const isPostExists = await prisma.post.findFirst({ where: { id: post_id } })
    if (isPostExists) {
        try {
            const commentEntry = await prisma.comment.create({
                data: {
                    comment: comment,
                    postId: post_id,
                    user_id: req.user.id,
                },
            })
            return res.status(200).send({ status: 201, message: 'Created', comment: commentEntry })
        } catch (err) {
            return next(err)
        }
    } else {
        return res.status(200).send({ status: 404, error: 'Not found', error_description: 'Post not found.' })
    }
}
export const Follows = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const body = req.body
    if (!helper.isValidatePaylod(body, ['user_id', 'action'])) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'user_id, action is required.' })
    }
    let { user_id, action } = req.body // action => 1: follow, 2: unfollow

    if (user_id === req.user.id) {
        return res
            .status(200)
            .send({ status: 400, error: 'Bad Request', error_description: "You can't follow yourself." })
    }

    if (Number.isNaN(Number(user_id)) || Number.isNaN(Number(action))) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'user_id, action should be a number.' })
    }
    user_id = Number(user_id)
    const isAlreadyFollowing = await prisma.follows.findFirst({
        where: { user_id: user_id, follower_id: req.user.id },
    })
    if (action === 1) {
        try {
            if (isAlreadyFollowing) {
                return res
                    .status(200)
                    .send({ status: 400, error: 'Bad Request', error_description: 'Already following this user' })
            }
            const entry = await prisma.follows.create({ data: { user_id: user_id, follower_id: req.user.id } })
            return res.status(200).send({ status: 200, message: 'Ok', follow: entry })
        } catch (err) {
            return next(err)
        }
    } else {
        try {
            if (!isAlreadyFollowing) {
                return res
                    .status(200)
                    .send({ status: 400, error: 'Bad Request', error_description: 'Not following this user' })
            }
            const follow = await prisma.follows.deleteMany({ where: { user_id: user_id, follower_id: req.user.id } })
            return res.status(200).send({ status: 200, message: 'Ok', unfollow: follow })
        } catch (err) {
            return next(err)
        }
    }
    return res.sendStatus(500)
}

const actionController = { LikePost, CommentPost, Follows }
export default actionController
