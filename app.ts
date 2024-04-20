import express, { Request, Response } from 'express'
import authRouter from './routes/auth.routes'
import middleware from './utils/middleware'
import userRouter from './routes/user.routes'
import postRouter from './routes/post.routes'
import statusMonitor from 'express-status-monitor'
import fs from 'fs'
import path from 'path'
import actionRouter from './routes/action.routes'
import tripRouter from './routes/trip.routes'
import ServiceRouter from './routes/service.routes'
import ExpenseRouter from './routes/expense.routes'
import cors from "cors";
const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(statusMonitor())
app.use(cors());
app.get('/ping', (_req, res) => {
    return res.status(200).send({ status: 200, message: 'pong' })
})

app.get('/public/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename
    const filepath = path.resolve('./public/images/' + filename)
    try {
        const stream = fs.createReadStream(filepath)
        stream.on('data', (chunk) => {
            res.write(chunk)
        })
        stream.on('end', () => res.end())
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
app.use('/expense', middleware.AuthMiddleware, ExpenseRouter)

app.use(middleware.ErrorHandler)
app.all('*', (_req, res) => {
    res.status(200).send({ status: 404, error: 'Not found', error_description: 'route or file not found.' })
})
export default app
