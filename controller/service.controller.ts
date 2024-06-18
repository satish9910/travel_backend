import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'
import { addMonths, parseISO } from 'date-fns';
const prisma = new PrismaClient()

export const CreateService = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const body = req.body
    if (
        !helper.isValidatePaylod(body, [
            'name',
            'description',
            'destination',
            'price',
            'host_id',
            'duration',
            'itinerary',
        ])
    ) {
        return res.status(200).send({
            status: 200,
            error: 'Invalid payload',
            error_description: 'name, description, destination, price, host id, duration, itinerary is required.',
        })
    }
    if (isNaN(Number(body.price)) || isNaN(Number(body.host_id)) || isNaN(Number(body.duration))) {
        return res.status(200).send({
            status: 400,
            error: 'Invalid payload',
            error_description: 'price, host id, duration should be a number.',
        })
    }

    const service = await prisma.service.create({
        data: {
            name: body.name,
            description: body.description,
            price: Number(body.price),
            host_id: Number(body.host_id),
            destination: body.destination,
            services: body.services,
            duration: Number(body.duration),
            itinerary: body.itinerary,
            type: Number(body.type),
            start_date: body.start_date,
            end_date: body.end_date,
            pickups: body.pickups,
            total_seats: Number(body.total_seats),
            available_seats: Number(body.available_seats),
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
            take: Number(limit),
        })
        return res.status(200).send({ status: 200, message: 'Ok', services: services })
    } catch (err) {
        return next(err)
    }
}

export const getFilteredServices = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let filteredServices = []
    const query = req.query
    const { page = 1, limit = 10, destination, start_date, seats } = query
    if (isNaN(Number(page)) || isNaN(Number(limit)) || isNaN(Number(seats)) || typeof destination !== 'string' || typeof start_date !== 'string') {
        return res
            .status(200)
            .send({ status: 400, error: 'Bad Request', error_description: 'Invalid Query Parameters' })
    }
    const skip = (Number(page) - 1) * Number(limit)
    try {
        const defaultServices = await GetDefaultServices(req, res, next, destination, skip, Number(limit));
        const groupServices = await getGroupServices(req, res, next, destination, start_date, Number(seats), skip, Number(limit));
        filteredServices = [...defaultServices, ...groupServices];
        return res.status(200).send({ status: 200, message: 'Ok', services: filteredServices, count: filteredServices.length })
    } catch (err) {
        return next(err)
    }
}

const GetDefaultServices = async (req: ExtendedRequest, res: Response, next: NextFunction, destination: string, skip: number, limit: number) => {
    const services = await prisma.service.findMany({
        where: {
            type: 0,
            destination: { equals: destination }
        },
        include: {
            host: {
                select: {
                    name: true,
                    photo: true
                }
            }
        },
        skip: skip,
        take: limit,
    })
    return services;
}

const getGroupServices = async (req: ExtendedRequest, res: Response, next: NextFunction, destination: string, start_date: string, seats: number, skip: number, limit: number) => {
    const startDate = parseISO(start_date.replace(/\/\//g, '-')).toISOString()
    const endDate = addMonths(parseISO(start_date), 1).toISOString();

    const services = await prisma.service.findMany({
        where: {
            type: 1,
            destination: { equals: destination },
            start_date: {
                gte: startDate,
                lt: endDate
            },
            available_seats: { gte: seats },
        },
        include: {
            host: {
                select: {
                    name: true,
                    photo: true
                }
            }
        },
        skip: skip,
        take: limit,
    })
    return services;
}

export const getServicesByHostId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const host_id = req.params.id
    if (isNaN(Number(host_id))) {
        return res
            .status(200)
            .send({ status: 400, error: 'Bad Request', error_description: 'Invalid Query Parameters' })
    }
    try {
        const services = await prisma.service.findMany({
            where: {
                host_id: { equals: Number(host_id) },
                type: { not: 2 }
            },
        })
        return res.status(200).send({ status: 200, message: 'Ok', services: services, count: services.length })
    } catch (err) {
        return next(err)
    }
}
export const getBidsByHostId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const host_id = req.params.id
    if (isNaN(Number(host_id))) {
        return res
            .status(200)
            .send({ status: 400, error: 'Bad Request', error_description: 'Invalid Query Parameters' })
    }
    try {
        const services = await prisma.service.findMany({
            where: {
                host_id: { equals: Number(host_id) },
                type: { equals: 2 }
            },
        })
        return res.status(200).send({ status: 200, message: 'Ok', bids: services, count: services.length })
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

    const service = await prisma.service.findFirst({
        where: { id: serviceId },
        include: {
            host: {
                select: {
                    name: true,
                    email: true,
                    description: true,
                    google_rating: true,
                    photo: true
                }
            }
        }
    })
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

    await prisma.trip.updateMany({
        where: { service_id: serviceId },
        data: { service_id: null },
    })
    const service = await prisma.service.delete({ where: { id: serviceId } })
    return res.status(200).send({ status: 200, message: 'Deleted', service })
}

const editServiceById = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
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

    const body = req.body

    if (!helper.isValidatePaylod(body, ['name', 'description', 'price', 'services', 'duration', 'itinerary'])) {
        return res.status(200).send({
            status: 200,
            error: 'Invalid payload',
            error_description: 'name, description, price, services, duration, itinerary is required.',
        })
    }

    const service = await prisma.service.update({
        where: { id: serviceId },
        data: {
            name: body.name,
            description: body.description,
            price: Number(body.price),
            host_id: body.host_id,
            destination: body.destination,
            services: body.services,
            duration: Number(body.duration),
            itinerary: body.itinerary,
        },
    })
    return res.status(200).send({ status: 200, message: 'Updated', service })
}

const uploadServicePics = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        let serviceId: string | number = req.params.id
        console.log(req.body);
        
        const files = req.body.imageUrls
        console.log(files);
        
        
        if (!serviceId) {
            return res
                .status(200)
                .send({ status: 400, error: 'Invalid payload', error_description: 'service_id is required in body.' })
        }
        if (!files) {
            return res
                .status(200)
                .send({ status: 400, error: 'Invalid payload', error_description: 'files are required.' })
        }
        if (!Array.isArray(files) || files.length > 5) {
            return res
                .status(200)
                .send({ status: 400, error: 'Invalid payload', error_description: 'Maximum 5 files are allowed.' })
        }

        const service = await prisma.service.update({
            where: { id: Number(serviceId) },
            data: {
                images: files
            },
        })
        return res.status(200).send({ status: 200, message: 'Pictures uploaded', service })
    } catch (err) {
        return next(err)
    }
}

const serviceController = {
    CreateService,
    GetAllServices,
    getSpecificService,
    deleteService,
    getServicesByHostId,
    editServiceById,
    uploadServicePics,
    getFilteredServices,
    getBidsByHostId
}
export default serviceController
