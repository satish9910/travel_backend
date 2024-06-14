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
    

export default SuperAdminRouter