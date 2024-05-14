import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'
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
            image: helper.imageUrlGen(req.file.filename),
            description: body.description,
            user_id: user.id,
            media_type: body.media_type
        },
    })
    return res.status(200).send({ status: 201, message: 'Created', post: post })
}

export const GetOnlyVideos = async (req: ExtendedRequest, res: Response, _next: NextFunction) => {
    const user = req.user
    const videos = await prisma.post.findMany({ where: { user_id: user.id, media_type: 'VIDEO' } })

    return res.status(200).send({ status: 200, message: 'Ok', videos })
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

    const post = await prisma.post.findFirst({ where: { id: postId }, include: { comment: true } })
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
        console.log(err)
        return res.status(200).send({ status: 404, error: 'Not found', error_description: 'Post not found.' })
    }
}
const postController = { CreatePost, GetPosts, GetSpecificPost, DeletePost, GetOnlyVideos }
export default postController
