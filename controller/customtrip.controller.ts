import { NextFunction, Response } from "express"
import helper from "../utils/helpers"
import { ExtendedRequest } from "../utils/middleware"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


export const InitialiseCustomTrip = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const body = req.body
    if (!helper.isValidatePaylod(body, ['number_of_people', 'itinerary', 'start_date', 'end_date'])) {
        return res.status(400).send({ error: 'Invalid payload', error_description: 'number of people, itinerary, start_date, end_date is required.' })
    }
    const { number_of_people, itinerary, start_date, end_date, duration } = req.body
    if (Number.isNaN(Number(number_of_people))) {
        return res.status(400).send({ error: 'Invalid payload', error_description: 'number_of_people should be a number.' })
    }
    try {
        const customTrip = await prisma.customTrip.create({
            data: {
                user_id: user.id,
                number_of_people: number_of_people,
                itinerary: itinerary,
                start_date: start_date,
                end_date: end_date,
                duration: itinerary.length
            }
        })
        return res.status(200).send({ status: 200, message: 'Ok', custom_trip: customTrip })
    } catch (err: unknown) {
        return res.status(500).send({ error: 'Internal Server Error', error_description: 'An error occurred while creating custom trip.' })
    }
}

export const deleteCustomTrip = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const customTripId = Number(req.params.id)
    if (!customTripId) {
        return res.status(400).send({ error: 'Invalid payload', error_description: 'custom trip id is required.' })
    }
    try {
        const customTrip = await prisma.customTrip.findFirst({ where: { id: customTripId } })
        if (!customTrip) {
            return res.status(404).send({ error: 'Not found', error_description: 'Custom trip not found.' })
        }
        if (customTrip.user_id !== user.id) {
            return res.status(403).send({ error: 'Forbidden', error_description: 'You are not allowed to delete this custom trip.' })
        }
        await prisma.customTrip.delete({ where: { id: customTripId } })
        return res.status(200).send({ status: 200, message: 'Deleted', custom_trip: customTrip })
    } catch (err: unknown) {
        return res.status(500).send({ error: 'Internal Server Error', error_description: 'An error occurred while deleting custom trip.' })
    }
}

export const AllCustomTrips = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try{
        const customTrips = await prisma.customTrip.findMany()
        return res.status(200).send({ status: 200, message: 'Ok', custom_trips: customTrips })
    }catch(err){
        return next(err)
    }
}

export const getCustomTripById = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const customTripId = Number(req.params.id)
    if (!customTripId) {
        return res.status(400).send({ error: 'Invalid payload', error_description: 'custom trip id is required.' })
    }
    try {
        const customTrip = await prisma.customTrip.findFirst({ where: { id: customTripId } })
        if (!customTrip) {
            return res.status(404).send({ error: 'Not found', error_description: 'Custom trip not found.' })
        }
        return res.status(200).send({ status: 200, message: 'Ok', custom_trip: customTrip })
    } catch (err: unknown) {
        return res.status(500).send({ error: 'Internal Server Error', error_description: 'An error occurred while fetching custom trip.' })
    }

}


const customTripController = {InitialiseCustomTrip, deleteCustomTrip, AllCustomTrips, getCustomTripById}

export default customTripController