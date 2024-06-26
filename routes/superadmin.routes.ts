import { Router } from 'express'
import superAdminController from '../controller/superadmin.controller'
const SuperAdminRouter = Router()

//@ts-ignore
SuperAdminRouter
    //@ts-ignore
    .get('/users', superAdminController.getAllUsers)
    //@ts-ignore
    .get('/vendors', superAdminController.getAllVendors)
    //@ts-ignore
    .post('/vendor', superAdminController.createVendor)
    //@ts-ignore
    .get('/vendor-services/:host_id', superAdminController.hostServices)
    //@ts-ignore
    .get('/vendor-trips/:host_id', superAdminController.hostTrips)
    //@ts-ignore
    .get('/user-trips/:user_id', superAdminController.userTrips)
    //@ts-ignore
    .post('/kyc', superAdminController.getKycDetails)
    //@ts-ignore
    .post('/kyc/handle', superAdminController.handleKyc)
    //@ts-ignore
    .get('/service-options', superAdminController.getServiceOptions)
    //@ts-ignore
    .post('/service-option', superAdminController.addServiceOption)
    //@ts-ignore
    .delete('/service-option/:id', superAdminController.deleteServiceOption)
    

export default SuperAdminRouter