import { Router } from 'express'
import customTripController from '../controller/customtrip.controller'
import middleware from '../utils/middleware'

const customRouter = Router()

//@ts-ignore
customRouter.post('/', middleware.AuthMiddleware, customTripController.InitialiseCustomTrip)
//@ts-ignore
customRouter.get('/all', middleware.HostAuthMiddleware, customTripController.AllCustomTrips)  
//@ts-ignore
customRouter.delete('/:id', middleware.AuthMiddleware, customTripController.deleteCustomTrip)
//@ts-ignore
customRouter.get('/:id', middleware.HostAuthMiddleware, customTripController.getCustomTripById) 
//@ts-ignore
customRouter.post('/service', middleware.HostAuthMiddleware, customTripController.createCustomService)  
//@ts-ignore
customRouter.get('/bids/:id', middleware.AuthMiddleware, customTripController.getBids)
//@ts-ignore
customRouter.post('/bid/accept', middleware.AuthMiddleware, customTripController.acceptBid)
//@ts-ignore
customRouter.post("/verify", middleware.AuthMiddleware, customTripController.CustomTripPaymentVerification)
export default customRouter
