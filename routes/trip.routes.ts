import { Router } from 'express'
import tripController from '../controller/trip.controller'
const TripRouter = Router()

//@ts-ignore
TripRouter
    //@ts-ignore
    .post('/', tripController.CreateTrip)
    //@ts-ignore
    .get('/', tripController.GetTrips)

    
export default TripRouter


