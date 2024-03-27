import { Router } from 'express'
import postController from '../controller/posts.controller'
import { upload } from '..'
import middleware from '../utils/middleware'
const postRouter = Router()

//@ts-ignore
postRouter
    //@ts-ignore
    .get('/', postController.GetPosts)
    //@ts-ignore
    .get('/:id', postController.GetSpecificPost)
    //@ts-ignore
    .post('/', upload.single('image'), postController.CreatePost)
    //@ts-ignore
    .delete('/:id', postController.DeletePost)

export default postRouter
