import { Router } from 'express'
import destinationController from '../controller/destination.controller'
import middleware from '../utils/middleware'
import { upload } from '..'
const DestinationRouter = Router()

//@ts-ignore
DestinationRouter
    //@ts-ignore
    .post('/', middleware.superAdminAuthMiddleware, upload.single('image'), destinationController.createDestination)
    //@ts-ignore
    .get('/:id', destinationController.getSpecificDestination)
    //@ts-ignore
    .get('/', destinationController.getDestinations)
    //@ts-ignore
    .delete('/:id', middleware.superAdminAuthMiddleware, destinationController.deleteDestination)
    //@ts-ignore
    .get('/search/destination', destinationController.fetchAddressPredictions)
    //@ts-ignore
    .get('/search/destination/lat-long', destinationController.getLatLong)

    
export default DestinationRouter