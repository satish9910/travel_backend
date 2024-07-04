import { Router } from 'express'
import destinationController from '../controller/destination.controller'
import middleware from '../utils/middleware'
const DestinationRouter = Router()

//@ts-ignore
DestinationRouter
    //@ts-ignore
    .post('/', middleware.superAdminAuthMiddleware, destinationController.createDestination)
    //@ts-ignore
    .get('/:id', destinationController.getSpecificDestination)
    //@ts-ignore
    .get('/', destinationController.getDestinations)
    //@ts-ignore
    .delete('/:id', middleware.superAdminAuthMiddleware, destinationController.deleteDestination)

    
export default DestinationRouter