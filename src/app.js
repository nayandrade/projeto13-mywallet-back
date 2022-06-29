import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import joi from 'joi';
import chalk from 'chalk';
import dayjs from 'dayjs';

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db('myWallet');
});

const app = express();
app.use(json());
app.use(cors());

app.post('/signup', async(req, res) => {
    const user = req.body
    if (user.password !== user.confirmPassword) {
        res.status(422).send(`Senhas não conferem`) //talvez por o return
    }
    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        confirmPassword: joi.string().required()
    })
    const { error } = userSchema.validate(user)
    if (error) {
        res.sendStatus(422) //talvez por o return
    }
    const passwordHash = bcrypt.hashSync(user.password, 10);
    try {
        const validUser = await db.collection('users').find( { email: user.email } ).toArray();
        console.log(validUser)
        if(validUser.length > 0) {
            return res.status(422).send(`Usuário já cadastrado`)
        }
        await db.collection('users').insertOne({ ...user, password: passwordHash, confirmPassword: passwordHash })
        res.status(201).send('Usuário criado com sucesso')
    } catch (error) {
        res.sendStatus(500)    
    }
})

app.post('/signin', async(req, res) => {
    const user = req.body
    console.log(user)
    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    })
    const { error } = userSchema.validate(user)
    if (error) {
        res.status(422).send()
    }

    try {
        const validUser = await db.collection('users').find( { email: user.email } ).toArray();
        console.log(validUser)
        if(validUser && bcrypt.compareSync(user.password, validUser[0].password)) {
            const token = uuid()
            console.log(token)
            await db.collection('session').insertOne({ userId: validUser[0]._id, token })
            res.status(201).send({ token })
        } else {
            res.status(401).send(`Usuário ou senha inválidos`)
        }   
    } catch (error) {
        res.sendStatus(500)
    }
})

app.post('/transaction', async(req, res) => {
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
        res.status(422).send(`dados da transação incorretos`)
    }

    try {
        const session = await db.collection('session').findOne({token})
        if(!session) {
            return res.sendStatus(401)
        }
        await db.collection('transactions').insertOne({...transaction, userId: session.userId, date: today})
        res.status(201).send('transação criada com sucesso')
    } catch (error) {
        res.sendStatus(500)
    }
})

app.get('/transaction', async(req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '');
    try {
        const session = await db.collection('session').findOne({token})
        if(!session) {
            return res.sendStatus(401)
        }
        const transactions = await db.collection('transactions').find({userId: new ObjectId(session.userId)}).toArray()
        res.send(transactions)
    } catch (error) {
        res.sendStatus(500)
    }

})

app.listen(5002, () => {
    console.log(chalk.bold.yellow('Server running on port 5000'));
})