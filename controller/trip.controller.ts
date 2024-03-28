import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const CreateTrip = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const body = req.body
    if (!helper.isValidatePaylod(body, ['destination', 'start_date', 'end_date', 'number_of_people', 'service', 'pincode'])) {
        return res
            .status(200)
            .send({ status: 200, error: 'Invalid payload', error_description: 'destination, start_date, end_date is required.' })
    }
    const trip = await prisma.trip.create({
        data: {
            destination: body.destination,
            start_date: new Date(body.start_date),
            end_date: new Date(body.end_date),
            user: user.id,
            number_of_people: body.number_of_people,
            service: body.service,
            pincode: body.pincode,
        },
    })
    return res.status(200).send({ status: 201, message: 'Created', trip: trip })
}

export const GetTrips = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const trips = await prisma.trip.findMany({
        where: {
            user_id: user.id,
        },
    })
    return res.status(200).send({ status: 200, trips: trips })
}


const tripController = { CreateTrip, GetTrips }
export default tripController