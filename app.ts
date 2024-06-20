import express, { Request, Response } from 'express'
import authRouter from './routes/auth.routes'
import middleware from './utils/middleware'
import userRouter from './routes/user.routes'
import postRouter from './routes/post.routes'
import fs from 'fs'
import path from 'path'
import http from 'http';
import { Server } from 'socket.io';
import actionRouter from './routes/action.routes'
import tripRouter from './routes/trip.routes'
import ServiceRouter from './routes/service.routes'
import ExpenseRouter from './routes/expense.routes'
import cors from 'cors'
import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const app = express()
import morgan from 'morgan'
import DestinationRouter from './routes/destination.routes'
import HostRouter from './routes/host.routes'
import customtriprouter from './routes/customtrips.routes'
import faqRouter from './routes/faq.routes'
import forumRouter from './routes/forum.routes'
import messageRouter from './routes/message.routes'
import SuperAdminRouter from './routes/superadmin.routes'
app.use(express.static('public'))
app.use(express.json())
// app.use(express.urlencoded({ extended: true }));

// app.use(statusMonitor())
app.use(morgan('tiny'))
app.use(cors())

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

export const getReceiverSocketId = (receiverId: string) => {
    return userSocketMap[receiverId]
}

const userSocketMap: { [key: string]: string } = {};

io.on('connection', (socket) => {
    console.log('user connected', socket.id);
    const userId = socket.handshake.query.userId
    if (typeof userId === 'string') {
        userSocketMap[userId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
        for(const key in userSocketMap){
            if(userSocketMap[key] === socket.id){
                delete userSocketMap[key]
            }
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
})

app.get('/ping', (_req, res) => {
    return res.status(200).send({ status: 200, message: 'pong' })
})

app.get('/public/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename
    const filepath = path.resolve('./public/images/' + filename)
    try {
        const stream = fs.createReadStream(filepath)
        stream.on('data', (chunk) => res.write(chunk))
        stream.on('end', () => res.end())
        stream.on('error', (err) => {
            return res.sendStatus(404)
        })
    } catch (err) {
        return res.sendStatus(404)
    }
})

app.use('/auth', authRouter)
// @ts-ignore
app.use('/user', middleware.AuthMiddleware, userRouter)
// @ts-ignore
app.use('/post', middleware.AuthMiddleware, postRouter)
// @ts-ignore
app.use('/action', middleware.AuthMiddleware, actionRouter)
// @ts-ignore
app.use('/trip', middleware.AuthMiddleware, tripRouter)
// @ts-ignore
app.use('/service', ServiceRouter)
// @ts-ignore
app.use('/host', middleware.HostAuthMiddleware, HostRouter)
// @ts-ignore
app.use('/destination', DestinationRouter)
// @ts-ignore
app.use('/expense', middleware.AuthMiddleware, ExpenseRouter)
//@ts-ignore
app.use('/custom', customtriprouter)
//@ts-ignore
app.use('/faq', faqRouter)
//@ts-ignore
app.use("/forum", middleware.AuthMiddleware, forumRouter)
//@ts-ignore
app.use('/message', middleware.AuthMiddleware, messageRouter)
// @ts-ignore
app.use('/superAdmin', SuperAdminRouter)

cron.schedule('0 0 * * *', async () => {      
    console.log('Running your daily task...')

    try {
        const trips = await prisma.trip.findMany({})

        for (const trip of trips) {
            const startDate = new Date(trip.start_date)
            const endDate = new Date(trip.end_date)
            const today = new Date()

            if (trip.cancelled) {
                await prisma.trip.update({
                    where: { id: trip.id },
                    data: { status: 'cancelled' },
                })
            } else if (endDate < today) {
                await prisma.trip.update({
                    where: { id: trip.id },
                    data: { status: 'completed' },
                })
                await prisma.user.update({
                    where: { id: trip.user_id },
                    data: { status: false },
                })
            } else if (startDate < today && today < endDate) {
                await prisma.trip.update({
                    where: { id: trip.id },
                    data: { status: 'ongoing' },
                })
                await prisma.user.update({
                    where: { id: trip.user_id },
                    data: { status: true },
                })
            } else {
                await prisma.trip.update({
                    where: { id: trip.id },
                    data: { status: 'upcoming' },
                })
            }
        }

        console.log('Trip statuses updated successfully.')
    } catch (error) {
        console.error('Error updating trip statuses:', error)
    }
})

app.use(middleware.ErrorHandler)
app.all('*', (_req, res) => {
    res.status(200).send({
        status: 404,
        error: 'Not found',
        error_description: `(${_req.url}), route or file not found.`,
    })
})

export default server
export { io, server}
