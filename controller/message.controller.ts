import { NextFunction, Response } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import { getReceiverSocketId, io } from '../app'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const sendMessage = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const senderId = req.user.id
        const receiverId = req.params.receiverId
        const message = req.body.message
        if (!message || !receiverId) return res.status(400).send({ message: 'Receiver and message are required' })
        if (senderId === receiverId) return res.status(400).send({ message: 'You can not send message to yourself' })
        let senderConversations = await prisma.participant.findMany({
            where: {
                userId: senderId,
            },
        })
        let senderConversationIds = senderConversations.map((participant) => participant.conversationId)

        let getConversation = await prisma.conversation.findFirst({
            where: {
                id: {
                    in: senderConversationIds,
                },
                participants: {
                    some: {
                        userId: Number(receiverId),
                    },
                },
            },
        })
       
        if (!getConversation) {
            getConversation = await prisma.conversation.create({
                data: {},
            })

            await prisma.participant.create({
                data: {
                    userId: senderId,
                    conversationId: getConversation.id,
                },
            })
            
            await prisma.participant.create({
                data: {
                    userId: Number(receiverId),
                    conversationId: getConversation.id,
                },
            })
        }

        const newMessage = await prisma.message.create({
            data: {
                user_id: senderId,
                receiver_id: Number(receiverId),
                message,
                conversation_id: getConversation.id,
            },
        })
        
        if (newMessage) {
            await prisma.conversation.update({
                where: { id: getConversation.id },
                data: {
                    messages: {
                        connect: { id: newMessage.id },
                    },
                },
            })
        }
        
        const receiverSocketId = getReceiverSocketId(receiverId)
        console.log(receiverSocketId, 'receiver socket id');
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', { message: newMessage })
            console.log('message sent to receiver');
        }

        return res.status(200).send({ message: 'Message sent' })
    } catch (err) {
        return res.status(500).send({ message: 'Error sending message' })
    }
}

export const getConversation = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const senderId = req.user.id
        const receiverId = req.params.receiverId

        if (!receiverId) return res.status(400).send({ message: 'Receiver is required' })
        if (senderId === receiverId)
            return res.status(400).send({ message: 'You can not get conversation with yourself' })

        let senderConversations = await prisma.participant.findMany({
            where: {
                userId: senderId,
            },
        })
        let senderConversationIds = senderConversations.map((participant) => participant.conversationId)

        const getConversation = await prisma.conversation.findFirst({
            where: {
                id: {
                    in: senderConversationIds,
                },
                participants: {
                    some: {
                        userId: Number(receiverId),
                    },
                },
            },
            include: { messages: true, participants: true },
        })

        if (!getConversation) return res.status(404).send({ message: 'No conversation found' })
        return res.status(200).send({ conversation: getConversation })
    } catch (err) {
        return res.status(500).send({ message: 'Error getting conversation' })
    }
}

export const getAllConversations = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const senderId = req.user._id
        let conversations = await prisma.conversation.findMany({
            where: { participants: { some: { user: { id: senderId } } } },
            include: { messages: true, participants: {select: {user: {select: {username: true, image: true, id: true}}}}},
        })
        return res.status(200).send({ conversations })
    } catch (err) {
        return res.status(500).send({ message: 'Error getting conversations' })
    }
}

const messageController = { sendMessage, getConversation, getAllConversations }
export default messageController
