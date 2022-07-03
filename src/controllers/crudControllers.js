import { ObjectId } from 'mongodb';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
import db from '../db.js';

export async function postTransaction(req, res) {
    dayjs.extend(utc);
    dayjs.extend(tz);
    const transaction = req.body
    const session = res.locals.session
    const today = dayjs().tz('America/Fortaleza').format('DD-MM')

    try {
        await db.collection('transactions').insertOne({value: parseFloat(transaction.value), description: transaction.description, userId: session.userId, date: today})
        res.status(201).send('transação criada com sucesso')
    } catch (error) {
        res.sendStatus(500)
    }
}

export async function getTransaction(req, res) {
    const session = res.locals.session
    let totalValue = 0
    
    try {
        const transactions = await db.collection('transactions').find({userId: new ObjectId(session.userId)}).toArray()
        console.log(transactions)
        transactions.map(transaction => {
            totalValue += transaction.value
        })
        const response = {
            transactions: transactions,
            totalValue: totalValue
        }
        
        res.send(response)
    } catch (error) {
        res.sendStatus(500)
    }
}