import { Router } from 'express'
import serviceController from '../controller/service.controller'
import { upload } from '..'
import middleware from '../utils/middleware'
const ServiceRouter = Router()

//@ts-ignore
ServiceRouter
    //@ts-ignore
    .post('/', middleware.HostAuthMiddleware, serviceController.CreateService)
    //@ts-ignore
    .get('/all', middleware.AuthMiddleware, serviceController.GetAllServices)
    //@ts-ignore
    .get('/', serviceController.GetServicesByDestination)
    //@ts-ignore
    .get('/:id',middleware.HostAuthMiddleware, serviceController.getSpecificService)
    //@ts-ignore
    .put('/:id', middleware.HostAuthMiddleware, serviceController.editServiceById)
    //@ts-ignore
    .get('/host/:id', middleware.HostAuthMiddleware, serviceController.getServicesByHostId)
    //@ts-ignore
    .delete('/:id', middleware.HostAuthMiddleware, serviceController.deleteService)
    //@ts-ignore
    .put('/servicePics/:id', middleware.HostAuthMiddleware, upload.array('files', 10), serviceController.uploadServicePics)

export default ServiceRouter
