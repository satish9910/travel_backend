import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const CreateExpense = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const body = req.body
    const trip = await prisma.trip.findFirst({ where: { id: body.trip_id } })
    if (!trip) {
        return res.status(404).send({ status: 404, error: 'Trip not found', error_description: 'Trip not found for the given id.' })
    }
    if (!helper.isValidatePaylod(body, ['amount', 'category', 'trip_id'])) {
        return res
            .status(200)
            .send({ status: 200, error: 'Invalid payload', error_description: 'amount, category is required.' })
    }
    const expense = await prisma.expense.create({
        data: {
            amount: body.amount,
            category: body.category,
            note: body.note,
            trip_id: body.trip_id,
            user_id: user.id,
        },
    })
    return res.status(200).send({ status: 201, message: 'Created', expense: expense })
}

export const GetAllExpenses = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    const expenses = await prisma.expense.findMany({
        where: { user_id: user.id },
    })
    let total = 0
    expenses.forEach((expense) => {
        total += expense.amount
    })
    return res.status(200).send({ status: 200, expenses: expenses, total: total })
}

export const GetTripExpenses = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
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
    const expenses = await prisma.expense.findMany({
        where: { user_id: user.id, trip_id: tripId },
    })
    let total = 0
    expenses.forEach((expense) => {
        total += expense.amount
    })
    return res.status(200).send({ status: 200, expenses: expenses, total: total })
}

const expenseController = {CreateExpense, GetTripExpenses, GetAllExpenses}

export default expenseController
