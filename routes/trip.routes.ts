import { Router } from 'express'
import tripController from '../controller/trip.controller'
const TripRouter = Router()

//@ts-ignore
TripRouter
    //@ts-ignore
    .post('/', tripController.CreateTrip)
    //@ts-ignore
    .get('/', tripController.GetTrips)
    //@ts-ignore
    .get('/:id', tripController.GetSpecificTrip)

    
export default TripRouter


