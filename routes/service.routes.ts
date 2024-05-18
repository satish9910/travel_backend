import { Router } from 'express'
import serviceController from '../controller/service.controller'
import { upload } from '..'
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
    //@ts-ignore
    .put('/servicePics', upload.array("files", 5), serviceController.uploadServicePics)
    
export default ServiceRouter


