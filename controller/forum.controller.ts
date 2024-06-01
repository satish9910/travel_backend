import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import { PrismaClient } from '@prisma/client'
import helper from '../utils/helpers'
const prisma = new PrismaClient()

const createForumQuestion = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    console.log(user, 'user')

    const body = req.body
    console.log(body, 'body')

    try {
        if (!helper.isValidatePaylod(body, ['question'])) {
            return res.status(200).send({ error: 'Invalid payload', error_description: 'question is required.' })
        }
        const forumQuestion = await prisma.forumQuestion.create({ data: { question: body.question, user_id: user.id } })
        return res.status(200).send({ message: 'forum question created', forumQuestion })
    } catch (err) {
        return next(err)
    }
}

const getAllForumQuestions = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const forumQuestions = await prisma.forumQuestion.findMany({
            include: { 
            user: { select: { id: true, username: true, image: true } }, 
            answers: { select: { id: true }},
            likes: { select: { id: true }}
            },
        })

        const forumQuestionsWithAnswerAndLikeCount = forumQuestions.map(question => ({
            ...question,
            answerCount: question.answers.length,
            likeCount: question.likes.length
        }))

        return res.status(200).send({ forumQuestions: forumQuestionsWithAnswerAndLikeCount })
    } catch (err) {
        return next(err)
    }
}

const getForumQuestion = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const questionId = Number(req.params.id)
    try {
        const forumQuestion = await prisma.forumQuestion.findUnique({
            where: { id: questionId },
            include: {
                user: { select: { id: true, username: true, image: true } },
                answers: { include: { User: { select: { id: true, username: true, image: true } } } },
                // likes: { select: { id: true }}
            },
        })
        return res.status(200).send({ forumQuestion })
    } catch (err) {
        return next(err)
    }
}

const createAnswer = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const questionId = Number(req.params.id)
    const body = req.body
    try {
        if (!helper.isValidatePaylod(body, ['answer'])) {
            return res.status(200).send({ error: 'Invalid payload', error_description: 'answer is required.' })
        }
        const forumAnswer = await prisma.forumAnswer.create({
            data: { answer: body.answer, user_id: user.id, question_id: questionId },
        })
        const allAnswers = await prisma.forumAnswer.findMany({where: { question_id: questionId }})
        return res.status(200).send({ message: 'forum answer created', allAnswers })
    } catch (err) {
        return next(err)
    }
}

export const likeQuestion = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const questionId = Number(req.params.id)
    try {
        const isLiked = await prisma.qLikes.findFirst({
            where: { question_id: questionId, user_id: user.id },
        })
        if (isLiked) {
            await prisma.qLikes.delete({ where: { id: isLiked.id } })
            return res.status(200).send({ message: 'Question unliked' })
        } else {
            await prisma.qLikes.create({ data: { question_id: questionId, user_id: user.id } })
            return res.status(200).send({ message: 'Question liked' })
        }
    } catch (err) {
        return next(err)
    }
}

const forumController = { createForumQuestion, getAllForumQuestions, getForumQuestion, createAnswer, likeQuestion }

export default forumController
