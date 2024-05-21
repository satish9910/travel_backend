import { Router } from 'express'
import expenseController from '../controller/expense.controller'
const ExpenseRouter = Router()

//@ts-ignore
ExpenseRouter
    //@ts-ignore
    .get('/:id', expenseController.GetTripExpenses)
    //@ts-ignore
    .get('/all/trips', expenseController.getEachTripsExpenses)
    // @ts-ignore
    .post('/', expenseController.CreateExpense)
    

export default ExpenseRouter