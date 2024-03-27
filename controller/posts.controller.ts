import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
const prisma = new PrismaClient()

export const CreatePost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const body = req.body
    if (!helper.isValidatePaylod(body, ['description']) || !req.file) {
        return res
            .status(200)
            .send({ status: 200, error: 'Invalid payload', error_description: 'description & image is required.' })
    }
    const post = await prisma.post.create({
        data: {
            image: req.file?.filename,
            description: body.description,
            user_id: user.id,
        },
    })
    return res.status(200).send({ status: 201, message: 'Created', post: post })
    // return res
    //     .status(200)
    //     .send({ status: 500, error: 'Incomplete route', error_description: 'post creation in db is pending' })
}

export const GetPosts = async (req: ExtendedRequest, res: Response, _next: NextFunction) => {
    const user = req.user
    const posts = await prisma.post.findMany({ where: { user_id: user.id } })

    return res.status(200).send({ status: 200, message: 'Ok', posts })
}

export const GetSpecificPost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let postId: string | number = req.params.id
    if (!postId) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(post) is required in params.' })
    }
    postId = Number(postId)
    if (Number.isNaN(postId)) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(post) should be a number.' })
    }

    const post = await prisma.post.findFirst({ where: { id: postId } })
    if (!post) {
        return res.status(200).send({ status: 404, error: 'Not found', error_description: 'Post not found.' })
    }
    return res.status(200).send({ status: 200, message: 'Ok', post })
}

export const DeletePost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const param = req.params
    if (!helper.isValidatePaylod(param, ['id'])) {
        return res
            .status(200)
            .send({ status: 200, error: 'Invalid payload', error_description: 'id(post) is required.' })
    }
    let postId: string | number = param.id
    if (!postId) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(post) is required in body.' })
    }
    postId = Number(postId)
    if (Number.isNaN(postId)) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(post) should be a number.' })
    }

    try {
        const deleted_post = await prisma.post.delete({ where: { id: postId, user_id: req.user.id } })
        // TODO delete image stored locally
        // fs.
        return res.status(200).send({ status: 202, message: 'Accepted', post: deleted_post })
    } catch (err) {
        return res.status(200).send({ status: 404, error: 'Not found', error_description: 'Post not found.' })
    }
}

// TODO CREATE NEW TABLE FOR LIKES, AND CREATE NEW ENTRY ON EVERY LIKE,
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
export const CommentPost = () => {}
const postController = { CreatePost, GetPosts, GetSpecificPost, DeletePost, LikePost, CommentPost }
export default postController
