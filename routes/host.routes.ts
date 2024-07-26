import { Router } from 'express'
import hostController from '../controller/host.controller'
import { upload } from '..';
const HostRouter = Router()

//@ts-ignore
HostRouter
    //@ts-ignore
    .get('/trips', hostController.getHostedTrips)
    //@ts-ignore
    .get('/trip/:id', hostController.GetSpecificTripHost)
    //@ts-ignore
    .get('/profile/:id', hostController.getHostProfile)
    //@ts-ignore
    .post("/profile/:id", upload.single("image"), hostController.updateHostProfile)
    //@ts-ignore
    .put('/profile/update/:id', hostController.updateProfile)
    //@ts-ignore
    .put('/password/:id', hostController.changeHostPassword)
    
export default HostRouter