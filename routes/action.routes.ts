import { Router } from 'express'
import actionController from '../controller/action.controller.'

const actionRouter = Router()

actionRouter
    //@ts-ignore
    .post('/like', actionController.LikePost)
    // .post('/like', middleware.AccountVerificationHandler, postController.LikePost)
    //@ts-ignore
    .post('/comment', actionController.CommentPost)
    //@ts-ignore
    .post('/follow', actionController.Follows)

export default actionRouter
