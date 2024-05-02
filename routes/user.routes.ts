// eslint-disable-next-line @typescript-eslint/ban-ts-comment@ts-nocheck
import { Router } from 'express'
import userController from '../controller/user.controller'
import { upload } from '../index'
const userRouter = Router()

userRouter
    //@ts-ignore
    .get('/all', userController.get_all_users)
    //@ts-ignore
    .get("/suggest", userController.getSuggestion)
    //@ts-ignore
    .get('/feed', userController.get_user_feed)
    //@ts-ignore
    .get('/', userController.get_user_details)
    //@ts-ignore
    .put('/', upload.single('profile_pic'), userController.update_user)
    //@ts-ignore
    .get('/followers', userController.Get_follower)
    //@ts-ignore
    .get('/following', userController.GET_following)
export default userRouter
