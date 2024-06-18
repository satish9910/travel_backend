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
    .post("/verify", tripController.PaymentVerification)
    //@ts-ignore
    .get('/:id', tripController.GetSpecificTrip)
    //@ts-ignore
    .put('/:id', tripController.cancelTrip)
    //@ts-ignore
    .get('/locations', tripController.getLocations)
export default TripRouter


