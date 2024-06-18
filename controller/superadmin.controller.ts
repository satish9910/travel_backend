import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const getAllUsers = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, username: true, phone: true, trips: true },
        })
        return res.status(200).send({ status: 200, users: users, count: users.length })
    } catch (err) {
        return res.status(400).send({ error: 'Error in getting users' })
    }
}

const createVendor = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const { name, username, phone, password } = req.body
        const alreadyExists = await prisma.host.findFirst({ where: { OR: [{ username }, { phone }] } })
        if(alreadyExists) return res.status(400).send({ error: 'Vendor already exists' })
        const vendor = await prisma.host.create({
            data: { name, username, phone, password },
            select: { name: true, username: true, phone: true }
        })
        return res.status(200).send({ status: 200, vendor: vendor })
    } catch (err) {
        return res.status(400).send({ error: 'Error in creating vendor' })
    }
}

const getAllVendors = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const vendors = await prisma.host.findMany({
            select: { id: true, email: true, username: true, phone: true, trips: true, services: true, customTrips: true, photo: true },
        })
        return res.status(200).send({ status: 200, vendors: vendors, count: vendors.length })
    } catch (err) {
        return res.status(400).send({ error: 'Error in getting vendors' })
    }
}

export const hostServices = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const host_id = req.params.host_id
    
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

export const hostTrips = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const host_id = req.params.host_id
    
    if (isNaN(Number(host_id))) {
        return res
            .status(200)
            .send({ status: 400, error: 'Bad Request', error_description: 'Invalid Query Parameters' })
    }
    try {
        const trips = await prisma.trip.findMany({
            where: {
                host_id: { equals: Number(host_id) },
            },
            include: {
                user: true,
                service: true,
            }
        })
        return res.status(200).send({ status: 200, message: 'Ok', trips: trips, count: trips.length })
    } catch (err) {
        return next(err)
    }

}

const superAdminController = { getAllUsers, getAllVendors, createVendor, hostServices, hostTrips }
export default superAdminController
