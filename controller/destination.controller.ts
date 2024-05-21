import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const createDestination = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const body = req.body
    if (!helper.isValidatePaylod(body, ['destination', 'pincode'])) {
        return res.status(200).send({
            status: 200,
            error: 'Invalid payload',
            error_description: 'destination, pincode is required.',
        })
    }
    const destination = await prisma.destination.create({
        data: {
            destination: body.destination,
            description: body.description,
            pincode: body.pincode,
            image: body.image,
            features: body.features,
            customise_options: body.customise_options
        },
    })
    return res.status(200).send({ status: 201, message: 'Created', destination: destination })
}

export const getDestinations = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const destinations = await prisma.destination.findMany({})
        return res.status(200).send({ status: 200, message: 'Ok', destinations: destinations })
    } catch (err) {
        return next(err)
    }
}

export const deleteDestination = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let destinationId: string | number = req.params.id
    if (!destinationId) {
        return res.status(200).send({
            status: 400,
            error: 'Invalid payload',
            error_description: 'id(destination) is required in params.',
        })
    }
    destinationId = Number(destinationId)
    if (Number.isNaN(destinationId)) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(destination) should be a number.' })
    }
    const destination = await prisma.destination.delete({
        where: {
            id: destinationId,
        },
    })
    return res.status(200).send({ status: 200, message: 'Deleted', destination: destination })
}

export const getSpecificDestination = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let destinationId: string | number = req.params.id
    if (!destinationId) {
        return res.status(200).send({
            status: 400,
            error: 'Invalid payload',
            error_description: 'id(destination) is required in params.',
        })
    }
    destinationId = Number(destinationId)
    if (Number.isNaN(destinationId)) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'id(destination) should be a number.' })
    }
    const destination = await prisma.destination.findUnique({
        where: {
            id: destinationId,
        },
    })
    return res.status(200).send({ status: 200, message: 'Ok', destination: destination })

}

const destinationController = { createDestination, getDestinations, deleteDestination, getSpecificDestination }
export default destinationController
