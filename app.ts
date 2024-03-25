import express from 'express'
import authRouter from './routes/auth.routes'
import middleware from './utils/middleware'
import userRouter from './routes/user.routes'
const app = express()

app.use(express.static('public'))
app.use(express.json())

app.get('/ping', (_req, res) => {
    return res.status(200).send({ status: 200, message: 'pong' })
})

app.use('/auth', authRouter)
//@ts-ignore
app.use('/user', middleware.AuthMiddleware, userRouter)

app.use(middleware.ErrorHandler)
app.all('*', (_req, res) => {
    res.status(200).send({ status: 404, error: 'Not found', error_description: 'route or file not found.' })
})
export default app
