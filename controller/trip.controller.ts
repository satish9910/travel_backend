import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
    
export const CreateTrip = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const body = req.body
    const service = await prisma.service.findFirst({ where: { id: body.service_id } })
    if (!service) {
        return res.status(404).send({ status: 404, error: 'Service not found', error_description: 'Service not found for the given id.' })
    }
    if (!helper.isValidatePaylod(body, ['destination', 'start_date', 'number_of_people', 'service_id', 'cost'])) {
        return res
            .status(200)
            .send({ status: 200, error: 'Invalid payload', error_description: 'destination, start_date, end_date is required.' })
    }
    const trip = await prisma.trip.create({
        data: {
            destination: body.destination,             
            start_date: body.start_date,
            end_date: body.end_date,          
            number_of_people: body.number_of_people,    
            service_id: body.service_id,                
            user_id: user.id,
            cost: body.cost,
            host_id: service.host_id,
        },
    })
    if (service.type === 1) {
        if (service.available_seats !== null && service.available_seats < body.number_of_people) {
            return res.status(200).send({ status: 400, error: 'Not enough seats', error_description: 'Service does not have enough seats.' })
        }
        await prisma.service.update({
            where: { id: body.service_id },
            data: { available_seats: service.available_seats !== null ? service.available_seats - body.number_of_people : null },
        })
    }
    return res.status(200).send({ status: 201, message: 'Created', trip: trip })
}

export const GetTrips = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const trips = await prisma.trip.findMany({
        where: {
            user_id: user.id,
        },
        include: {
            service: true,
            host: {
                select: {
                    name: true,
                    username: true,
                    photo: true,
                },
            },
        },
    })
    return res.status(200).send({ status: 200, trips: trips })
}

export const GetSpecificTrip = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let tripId: string | number = req.params.id
    const user = req.user
    if (!tripId) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(trip) is required in params.' })
    }
    tripId = Number(tripId)
    if (Number.isNaN(tripId)) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(trip) should be a number.' })
    }

    const trip = await prisma.trip.findFirst({ where: { id: tripId, user_id: user.id }, include: {
        service: true,
        host: {
            select: {
                name: true,
                username: true,
                photo: true,
            },
        },
    }})
    if (!trip) {
        return res.status(200).send({ status: 404, error: 'Not found', error_description: 'Trip not found.' })
    }
    return res.status(200).send({ status: 200, message: 'Ok', trip })
}



const tripController = { CreateTrip, GetTrips, GetSpecificTrip }
export default tripController