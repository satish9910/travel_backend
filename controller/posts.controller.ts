import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const CreatePost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const body = req.body
    if (!helper.isValidatePaylod(body, ['image', 'description'])) {
        return res
            .status(200)
            .send({ status: 200, error: 'Invalid payload', error_description: 'description & image is required.' })
    }
    const post = await prisma.post.create({
        data: {
            image: body.image,
            description: body.description,
            user_id: user.id,
            media_type: body.media_type,
            latitude: body.latitude,
            longitude: body.longitude,
            place: body.place,
        },
    })
    return res.status(200).send({ status: 201, message: 'Created', post: post })
}
// export const CreatePost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
//     const user = req.user
//     const body = req.body
//     if (!helper.isValidatePaylod(body, ['description']) || !req.file) {
//         return res
//             .status(200)
//             .send({ status: 200, error: 'Invalid payload', error_description: 'description & image is required.' })
//     }
//     const post = await prisma.post.create({
//         data: {
//             image: helper.imageUrlGen(req.file.filename),
//             description: body.description,
//             user_id: user.id,
//             media_type: body.media_type,
//             latitude: body.latitude,
//             longitude: body.longitude,
//             place: body.place,
//         },
//     })
//     return res.status(200).send({ status: 201, message: 'Created', post: post })
// }

export const GetOnlyVideos = async (req: ExtendedRequest, res: Response, _next: NextFunction) => {
    const query = req.query
    const { page = 1, limit = 20 } = query
    if (Number.isNaN(page) || Number.isNaN(limit))
        return res.status(200).send({
            status: 400,
            error: 'Invalid query parameters',
            error_description: 'skip, limit should be a number',
        })

    const skip = (Number(page) - 1) * Number(limit)
    try {
        const fetchPosts = await prisma.post.findMany({
            where: { media_type: 'VIDEO' },
            include: {
            user: {
                select: {
                id: true,
                username: true,
                image: true,
                },
            },
            comment: true
            },
            orderBy: { created_at: 'desc' },
        })
        for (let i = 0; i < fetchPosts.length; i++) {
            const isLiked = await prisma.likes.findFirst({
                where: { post_id: fetchPosts[i].id, user_id: req.user.id },
            })
            //@ts-ignore
            fetchPosts[i].isLiked = isLiked ? true : false
        }
        return res.status(200).send({ status: 200, message: 'Ok', posts: fetchPosts })
    } catch (err) {
        return _next(err)
    }
}

// export const GetOnlyVideos = async (req: ExtendedRequest, res: Response, _next: NextFunction) => {
//     const user = req.user
//     const videos = await prisma.post.findMany({ where: { user_id: user.id, media_type: 'VIDEO' } })

//     return res.status(200).send({ status: 200, message: 'Ok', videos })
// }

export const GetPosts = async (req: ExtendedRequest, res: Response, _next: NextFunction) => {
    const user = req.user
    const posts = await prisma.post.findMany({ where: { user_id: user.id } })

    return res.status(200).send({ status: 200, message: 'Ok', posts })
}

export const GetPostsByUserId = async (req: ExtendedRequest, res: Response, _next: NextFunction) => {
    const id = req.body.userId
    const posts = await prisma.post.findMany({
        where: { user_id: id },
        include: {
            comment: true,
        },
    })
    const user = await prisma.user.findFirst({ where: { id: id } })
    const follower_count = await prisma.follows.count({ where: { user_id: id } })
    const trip_count = await prisma.trip.count({ where: { user_id: id } })

    return res
        .status(200)
        .send({ status: 200, message: 'Ok', posts, user_follower_count: follower_count, user_trip_count: trip_count, user: {user_id: user?.id, username: user?.username, image: user?.image} })
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

    const post = await prisma.post.findFirst({
        where: { id: postId },
        include: {
            comment: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    image: true,
                },
            },
        },
    })
    const follower_count = await prisma.follows.count({ where: { user_id: post?.user_id } })
    const trip_count = await prisma.trip.count({ where: { user_id: post?.user_id } })
    if (!post) {
        return res.status(200).send({ status: 404, error: 'Not found', error_description: 'Post not found.' })
    }
    return res
        .status(200)
        .send({ status: 200, message: 'Ok', post, user_follower_count: follower_count, user_trip_count: trip_count })
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
const postController = { CreatePost, GetPosts, GetSpecificPost, DeletePost, GetOnlyVideos, GetPostsByUserId }
export default postController
