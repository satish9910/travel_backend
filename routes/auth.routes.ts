import { Router } from 'express'
import authController from '../controller/auth.controller'

const authRouter = Router()

authRouter.post('/login', authController.Login)
authRouter.post('/signup', authController.Signup)
authRouter.post('/forgot', authController.ForgotPassword)
authRouter.post('/sendotp', authController.SendOtp)
authRouter.post('/verify', authController.VerifyOtp)

export default authRouter
