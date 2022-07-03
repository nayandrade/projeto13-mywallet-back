import { ObjectId } from 'mongodb';
import joi from 'joi';
import dayjs from 'dayjs';
import db from '../db.js';

export async function postTransaction(req, res) {
    const transaction = req.body
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '');
    const today = dayjs().format('DD-MM')

    const transactionSchema = joi.object({
        value: joi.number().required(),
        description: joi.string().required(),
    })
    const { error } = transactionSchema.validate(transaction)
    if (error) {
        return res.status(422).send(`dados da transação incorretos`)
    }

    try {
        const session = await db.collection('session').findOne({token})
        if(!session) {
            return res.sendStatus(401)
        }
        await db.collection('transactions').insertOne({value: parseFloat(transaction.value), description: transaction.description, userId: session.userId, date: today})
        res.status(201).send('transação criada com sucesso')
    } catch (error) {
        res.sendStatus(500)
    }
}

export async function getTransaction(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '');
    let totalValue = 0
    console.log(token)
    
    try {
        const session = await db.collection('session').findOne({token})
        console.log(session, session.userId)
        if(!session) {
            return res.sendStatus(401)
        }
        //const transactions = await db.collection('transactions').find({userId: session.userId}).toArray()
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