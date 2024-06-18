import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import { PrismaClient } from '@prisma/client'
import helper from '../utils/helpers'
const prisma = new PrismaClient()

const getHostedTrips = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const hostId = Number(req.query.id)
        if (!hostId) {
            return res
                .status(200)
                .send({ status: 400, error: 'Invalid payload', error_description: 'id(host) is required in params.' })
        }
        const trips = await prisma.trip.findMany({ where: { host_id: hostId }, include: { service: true, user: true } })
        return res.status(200).send({ status: 200, trips: trips, count: trips.length })
    } catch (err) {
        return res.status(400).send({ error: 'Error in getting hosted trips' })
    }
}

export const GetSpecificTripHost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let tripId: string | number = req.params.id
    const user = req.host
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

    const trip = await prisma.trip.findFirst({
        where: { id: tripId, user_id: user.id },
        include: { service: true, user: true },
    })
    if (!trip) {
        return res.status(200).send({ status: 404, error: 'Not found', error_description: 'Trip not found.' })
    }
    return res.status(200).send({ status: 200, message: 'Ok', trip })
}

const getHostProfile = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const hostId: string | number = req.params.id
    if (!hostId) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(host) is required in params.' })
    }
    const host = await prisma.host.findUnique({ where: { id: Number(hostId) } })
    return res.status(200).send({ status: 200, host })
}

const updateHostProfile = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const hostId: string | number = req.params.id

    const imageUrl = req.body.photo
    if (!hostId) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(host) is required in params.' })
    }

    const host = await prisma.host.update({ where: { id: Number(hostId) }, data: { ...req.body, photo: imageUrl } })
    return res.status(200).send({ status: 200, host })
}

const updateProfile = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const hostId: string | number = req.params.id
    console.log(hostId);
    
    const {name, description, email} = req.body
    const google_rating = parseFloat(req.body.google_rating)
    const host = await prisma.host.update({ where: { id: Number(hostId) }, data: { name, description, email, google_rating } })
    return res.status(200).send({ updated: host })
}


const hostController = { getHostedTrips, GetSpecificTripHost, getHostProfile, updateHostProfile, updateProfile }
export default hostController
