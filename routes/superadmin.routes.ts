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
    .get('/user-trips/:host_id', superAdminController.userTrips)
    

export default SuperAdminRouter