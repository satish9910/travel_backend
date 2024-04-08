import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const CreateService = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const body = req.body
    if (!helper.isValidatePaylod(body, ['name', 'description', 'price', 'host_id', 'duration', 'pincode'])) {
        return res
            .status(200)
            .send({ status: 200, error: 'Invalid payload', error_description: 'name, description, price, host id, pincode, duration is required.' })
    }
    const service = await prisma.service.create({
        data: {
            name: body.name,
            description: body.description,
            price: body.price,
            host_id: body.host_id,
            duration: body.duration,
            pincode: body.pincode
        },
    })
    return res.status(200).send({ status: 201, message: 'Created', service: service })
}

export const GetAllServices = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const query = req.query
    const { page = 1, limit = 10 } = query
    if (isNaN(Number(page)) || isNaN(Number(limit))) {
        return res
            .status(200)
            .send({ status: 400, error: 'Bad Request', error_description: 'Invalid Query Parameters' })
    }
    const skip = (Number(page) - 1) * Number(limit)
    try {
        const services = await prisma.service.findMany({
            skip: skip,
            take: Number(limit)
        })
        return res.status(200).send({ status: 200, message: 'Ok', services: services })
    } catch (err) {
        return next(err)
    }
}

export const GetServicesByPincode = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const query = req.query
    const { page = 1, limit = 10, pincode } = query
    if (isNaN(Number(page)) || isNaN(Number(limit)) || isNaN(Number(pincode))) {
        return res
            .status(200)
            .send({ status: 400, error: 'Bad Request', error_description: 'Invalid Query Parameters' })
    }
    const skip = (Number(page) - 1) * Number(limit)
    try {
        const services = await prisma.service.findMany({
            skip: skip,
            take: Number(limit),
            where: {
                pincode: Number(pincode)
            }
        })
        return res.status(200).send({ status: 200, message: 'Ok', services: services })
    } catch (err) {
        return next(err)
    }
}

export const getSpecificService = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let serviceId: string | number = req.params.id
    if (!serviceId) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(service) is required in params.' })
    }
    serviceId = Number(serviceId)
    if (Number.isNaN(serviceId)) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(service) should be a number.' })
    }

    const service = await prisma.service.findFirst({ where: { id: serviceId }})
    if (!service) {
        return res.status(200).send({ status: 404, error: 'Not found', error_description: 'Service not found.' })
    }
    return res.status(200).send({ status: 200, message: 'Ok', service })
}

export const deleteService = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let serviceId: string | number = req.params.id
    if (!serviceId) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(service) is required in params.' })
    }
    serviceId = Number(serviceId)
    if (Number.isNaN(serviceId)) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(service) should be a number.' })
    }

    const service = await prisma.service.delete({ where: { id: serviceId }})
    return res.status(200).send({ status: 200, message: 'Deleted', service })
}

const serviceController = { CreateService, GetAllServices, GetServicesByPincode, getSpecificService, deleteService }
export default serviceController