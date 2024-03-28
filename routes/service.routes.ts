import { Router } from 'express'
import serviceController from '../controller/service.controller'
const ServiceRouter = Router()

//@ts-ignore
ServiceRouter
    //@ts-ignore
    .post('/', serviceController.CreateService)
    //@ts-ignore
    .get('/', serviceController.GetServices)

    
export default ServiceRouter


