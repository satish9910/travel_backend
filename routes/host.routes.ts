import { Router } from 'express'
import hostController from '../controller/host.controller'
const HostRouter = Router()

//@ts-ignore
HostRouter
    //@ts-ignore
    .get('/trips', hostController.getHostedTrips)
    //@ts-ignore
    .get('/trip/:id', hostController.GetSpecificTripHost)
    //@ts-ignore
    .get('/profile/:id', hostController.getHostProfile)
    
export default HostRouter