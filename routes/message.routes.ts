import Router from "express";
import messageController from "../controller/message.controller";

const messageRouter = Router()

//@ts-ignore
messageRouter.post('/send/:receiverId', messageController.sendMessage)
//@ts-ignore
messageRouter.post('/conversation/:receiverId', messageController.getConversation)
//@ts-ignore
messageRouter.get('/conversations', messageController.getAllConversations)
//@ts-ignore
messageRouter.post('/group', messageController.createGroup)
//@ts-ignore
messageRouter.post('/group/:conversationId', messageController.sendGroupMessage)
//@ts-ignore
messageRouter.post('/group/add/:conversationId', messageController.addParticipantsToGroup)



export default messageRouter