import { Router } from 'express'
import serviceController from '../controller/service.controller'
const ServiceRouter = Router()

//@ts-ignore
ServiceRouter
    //@ts-ignore
    .post('/', serviceController.CreateService)
    //@ts-ignore
    .get('/all', serviceController.GetAllServices)
    //@ts-ignore
    .get('/', serviceController.GetServicesByDestination)
    //@ts-ignore
    .get('/:id', serviceController.getSpecificService)
    //@ts-ignore
    .put('/:id', serviceController.editServiceById)
    //@ts-ignore
    .get('/host/:id', serviceController.getServicesByHostId)
    //@ts-ignore
    .delete('/:id', serviceController.deleteService)

    
export default ServiceRouter


