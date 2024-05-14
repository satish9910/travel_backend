import { Router } from 'express'
import destinationController from '../controller/destination.controller'
const DestinationRouter = Router()

//@ts-ignore
DestinationRouter
    //@ts-ignore
    .post('/', destinationController.createDestination)
    //@ts-ignore
    .get('/', destinationController.getDestinations)
    //@ts-ignore
    .delete('/:id', destinationController.deleteDestination)

    
export default DestinationRouter