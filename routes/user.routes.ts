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
    .get("/search/:username", userController.getUsersByUsername)
    //@ts-ignore
    .put("/status", userController.userTravelingStatus)
    //@ts-ignore
    .put("/visible", userController.visibleStatus)
    //@ts-ignore
    .post("/block", userController.blockUser)
    //@ts-ignore
    .get("/block", userController.getBlockedUsers)
    //@ts-ignore
    .post("/unblock", userController.unblockUser)
    //@ts-ignore
    .get('/feed', userController.get_user_feed)
    //@ts-ignore
    .get('/feed/:place', userController.feedByPlace)
    //@ts-ignore
    .get('/', userController.get_user_details)
    //@ts-ignore
    .put('/', upload.single('profile_pic'), userController.update_user)
    //@ts-ignore
    .get('/followers', userController.Get_follower)
    //@ts-ignore
    .get('/following', userController.GET_following)
    //@ts-ignore
    .put('/location', userController.updateLatLong)
    //@ts-ignore
    .get('/nearby', userController.getNearbyUsers)

export default userRouter
