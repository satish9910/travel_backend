import express, { Response } from 'express'
import dotenv from 'dotenv'
import authRouter from './routes/auth.routes'
import userRouter from './routes/user.routes'
import middleware from './utils/middleware'
dotenv.config()
const app = express()

app.use(express.json())

app.get('/ping', (req: any, res: Response) => {
    return res.status(200).send({ status: 200, message: 'pong' })
})

app.use('/auth', authRouter)
app.use('/user', userRouter)

app.use(middleware.ErrorHandler)

app.listen(process.env.PORT!, () => console.log(`Running of ${process.env.PORT}`))
