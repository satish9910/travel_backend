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
// customRouter.post('/service', middleware.AuthMiddleware, customTripController.createCustomService)  //host
export default customRouter
