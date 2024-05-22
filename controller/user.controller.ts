import { NextFunction, Request, Response } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import { PrismaClient } from '@prisma/client'
import helper from '../utils/helpers'
const prisma = new PrismaClient()

const get_all_users = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const query = req.query
    const { page = 1, limit = 10 } = query
    if (isNaN(Number(page)) || isNaN(Number(limit))) {
        return res
            .status(200)
            .send({ status: 400, error: 'Bad Request', error_description: 'Invalid Query Parameters' })
    }
    const skip = (Number(page) - 1) * Number(limit)
    try {
        const users = await prisma.user.findMany({
            skip: skip,
            take: Number(limit),
            where: { NOT: { id: req.user.id } },
        })
        delete (users as any).password
        return res.status(200).send({ status: 200, message: 'Ok', users: users })
    } catch (err) {
        return next(err)
    }
}

const get_user_feed = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const query = req.query
    const { page = 1, limit = 10 } = query
    if (Number.isNaN(page) || Number.isNaN(limit))
        return res.status(200).send({
            status: 400,
            error: 'Invalid query parameters',
            error_description: 'skip, limit should be a number',
        })

    const skip = (Number(page) - 1) * Number(limit)
    try {
        const userIdsObjArr = await prisma.follows.findMany({
            where: { follower_id: req.user.id },
            select: { user_id: true },
            skip: skip,
            take: Number(limit),
        })
        const userIds = userIdsObjArr.map((user_id) => user_id.user_id)
        const fetchPosts = await prisma.post.findMany({
            where: { user_id: { in: [...userIds, req.user.id] } },
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
        return next(err)
    }
}

const get_user_details = (req: ExtendedRequest, res: Response, _next: NextFunction) => {
    const user = req.user
    delete (user as any).password
    return res.status(200).send({ status: 200, message: 'Ok', user: user })
}

const update_user = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    let { username, gender, date_of_birth, bio, emergency_name, emergency_phone } = req.body
    if (gender) {
        gender = Number(gender)
        if (Number.isNaN(gender)) {
            return res.status(200).send({
                status: 200,
                error: 'Invalid Payload',
                error_description: "Gender type isn't correct. It should be a number",
            })
        }
    }
    if (!helper.isValidDateFormat(date_of_birth)) {
        return res.status(200).send({ status: 400, error: 'Bad Request', error_description: 'Invalid Date Format' })
    }

    date_of_birth = new Date(date_of_birth)

    let imagePath: string | undefined
    if (req.file) {
        imagePath = req.file.filename
    }
    let imageUrl
    if (imagePath) imageUrl = helper.imageUrlGen(imagePath)
    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { username, gender, date_of_birth, bio, image: imageUrl, emergency_name, emergency_phone },
        })
        delete (updatedUser as any).password
        delete (updatedUser as any).emergency_name
        delete (updatedUser as any).emergency_phone
        return res.status(200).send({ status: 200, message: 'Ok', user: updatedUser })
    } catch (err) {
        return next(err)
    }
}
const Get_follower = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    try {
        const followers = await prisma.follows.findMany({
            where: { user_id: user.id },
            select: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                        is_verified: true,
                    },
                },
            },
        })
        return res.status(200).send({ status: 200, message: 'Ok', followers: followers, count: followers.length})
    } catch (err) {
        return next(err)
    }
}

const GET_following = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    let followingCount = 0,
        following = []
    try {
        followingCount = await prisma.follows.count({ where: { follower_id: user.id } })
    } catch (err) {
        return next(err)
    }
    try {
        following = await prisma.follows.findMany({
            where: { follower_id: user.id },
            select: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                        is_verified: true,
                    },
                },
            },
        })
        return res.status(200).send({ status: 200, message: 'Ok', following: following, count: followingCount })
    } catch (err) {
        return next(err)
    }
}
const getSuggestion = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const query = req.query
    const { page = 1, limit = 10 } = query
    if (isNaN(Number(page)) || isNaN(Number(limit))) {
        return res
            .status(200)
            .send({ status: 400, error: 'Bad Request', error_description: 'Invalid Query Parameters' })
    }
    const skip = (Number(page) - 1) * Number(limit)
    try {
        const users = await prisma.user.findMany({
            skip: skip,
            take: Number(limit),
            where: { NOT: { id: req.user.id } },
            include: {
                _count: {
                    select: {
                        follows: true,
                    },
                },
            },
        })
        for (let i = 0; i < users.length; i++) {
            const user = users[i]
            const isFollowedByLiveUser = await prisma.follows.findFirst({
                where: { user_id: user.id, follower_id: req.user.id },
                select: {
                    follower_id: true,
                    user_id: true,
                },
            })
            // @ts-ignore
            users[i]['isFollows'] = isFollowedByLiveUser ? true : false
            //@ts-ignore
            users[i].followerCount = users[i]._count.Follows_by
            //@ts-ignore
            delete users[i]._count
        }
        delete (users as any).password
        delete (users as any).emergency_name
        delete (users as any).emergency_phone

        return res.status(200).send({ status: 200, message: 'Ok', users: users })
    } catch (err) {
        return next(err)
    }
}

const userTravelingStatus = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const { is_traveling } = req.body
    if (typeof is_traveling !== 'boolean') {
        return res.status(200).send({ status: 400, error: 'Bad Request', error_description: 'Invalid Payload' })
    }
    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { status: is_traveling },
        })
        delete (updatedUser as any).password
        return res.status(200).send({ status: 200, message: 'Ok', user: { updatedUser } })
    } catch (err) {
        return next(err)
    }
}

const feedByPlace = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const place = req.params.place
    const user = req.user
    if (!place) {
        return res.status(200).send({ status: 400, error: 'Bad Request', error_description: 'Place is required' })
    }
    if(typeof place !== 'string') {
        return res.status(200).send({ status: 400, error: 'Bad Request', error_description: 'Place should be a string' })
    }
    try {
        const posts = await prisma.post.findMany({
            where: { place: place },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        })
        for (let i = 0; i < posts.length; i++) {
            const isLiked = await prisma.likes.findFirst({
                where: { post_id: posts[i].id, user_id: user.id },
            })
            //@ts-ignore
            posts[i].isLiked = isLiked ? true : false
        }
        return res.status(200).send({ status: 200, message: 'Ok', posts: posts })
    } catch (err) {
        return next(err)
    }
}

const userController = {
    getSuggestion,
    get_all_users,
    get_user_feed,
    get_user_details,
    update_user,
    Get_follower,
    GET_following,
    userTravelingStatus,
    feedByPlace
}

export default userController
