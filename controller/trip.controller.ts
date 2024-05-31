import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import crypto from "node:crypto";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import Razorpay from 'razorpay';
import { error } from 'node:console';

const razorpayInstance = new Razorpay({
    key_id: process.env.KEY_ID!,
    key_secret: process.env.KEY_SECRET!
});

export const CreateTrip = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    // console.log(razorpayInstance.orders);
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
    if (service.type === 1) {
        if (service.available_seats !== null && service.available_seats < body.number_of_people) {
            return res.status(200).send({ status: 400, error: 'Not enough seats', error_description: 'Service does not have enough seats.' })
        }
        await prisma.service.update({
            where: { id: body.service_id },
            data: { available_seats: service.available_seats !== null ? service.available_seats - body.number_of_people : null },
        })
    }

    try {
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
        const order = await razorpayInstance.orders.create({
            "amount": body.cost,
            "currency": "INR",
        });
        return res.status(200).send({ status: 201, message: 'Created', trip: trip, gateways: { order_id: order.id, amount: order.amount, currency: order.currency } })
    } catch (err) {
        return res.status(200).send({ status: 500, error: "orderId or trip creation failed.", error_description: (err as Error)?.message })
    }
}

export const PaymentVerification = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    const body = req.body;

    if (!body) return res.status(200).send({ status: 400, error: "Invalid payload", error_description: "paymentId, orderId is required." })

    const { paymentId, orderId, tripId } = body;
    if (!paymentId || !orderId || !tripId || Number.isNaN(Number(tripId))) {
        return res.status(200).send({ status: 400, error: "Invalid payload", error_description: "paymentId, orderId ,tripId is required." });
    }
    const razorpay_signature = req.headers['x-razorpay-signature']
    if (!razorpay_signature) return res.status(200).send({ status: 400, message: "x-razorpay-signature" });
    let sha256 = crypto.createHmac('sha256', process.env.KEY_SECRET!);
    sha256.update(orderId + "|" + paymentId);

    const generated_signature = sha256.digest('hex');
    if (generated_signature === razorpay_signature) {
        const updatedTrip = await prisma.trip.update({
            where: { id: Number(tripId) }, data: {
                is_payment_confirmed: true
            }
        });
        return res.send({ status: 200, message: "Payment confirmed.", trip: updatedTrip });
    } else {
        return res.status(200).send({ status: 400, error: "incorrect payload", error_description: "payment couldn't be verified." });
    }

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
    const customs = await prisma.customTrip.findMany({
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
    const cstm = customs.map((at) => {
        //@ts-ignore
        return at.type = "custom";
    })
    const trp = trips.map((at) => {
        //@ts-ignore
        at.type = "build"
        return at;
    })

    const merged = [...trp, ...cstm];

    // console.log(merged.length)
    const finalTrips = merged.sort((a, b) => {
        // console.log(a, b);
        // @ts-ignore
        return (a?.created_at?.getTime() - b?.created_at?.getTime()) || -1;
    })

    return res.status(200).send({ status: 200, trips: finalTrips })
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

    const trip = await prisma.trip.findFirst({
        where: { id: tripId, user_id: user.id }, include: {
            service: true,
            host: {
                select: {
                    name: true,
                    username: true,
                    photo: true,
                },
            },
        }
    })
    if (!trip) {
        return res.status(200).send({ status: 404, error: 'Not found', error_description: 'Trip not found.' })
    }
    return res.status(200).send({ status: 200, message: 'Ok', trip })
}


const tripController = { CreateTrip, GetTrips, GetSpecificTrip, PaymentVerification }
export default tripController