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
        return res.status(422).send(`Senhas não conferem`)
    }
    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        confirmPassword: joi.string().required()
    })
    const { error } = userSchema.validate(user)
    if (error) {
        return res.sendStatus(422)
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
        return res.status(422).send()
    }

    try {
        const validUser = await db.collection('users').find( { email: user.email } ).toArray();
        console.log(validUser)
        if(validUser && bcrypt.compareSync(user.password, validUser[0].password)) {
            const token = uuid()
            console.log(token)
            await db.collection('session').insertOne({ userId: validUser[0]._id, token })
            res.status(200).send({name: validUser[0].name, token: token, userId: validUser[0]._id})
        } else {
            res.status(401).send(`Usuário ou senha inválidos`)
        }   
    } catch (error) {
        res.status(401).send(`Não autorizado`)
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
})

app.get('/transaction', async(req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '');
    let totalValue = 0
    
    try {
        const session = await db.collection('session').findOne({token})
        if(!session) {
            return res.sendStatus(401)
        }
        const transactions = await db.collection('transactions').find({userId: new ObjectId(session.userId)}).toArray()
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

})

app.delete('/session', async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '');
    
    try {
        const session = await db.collection('session').findOne({token})
        const userId = session.userId
        console.log(session, userId)

        if(!session) {
            return res.status(401).send('usuário não está online')
        }

        const logoutUser = await db.collection('session').deleteMany({userId});
        res.status(200).send(`usuário desconectado ${session.token}`);
    } catch (error) {
        res.status(500).send();
    }
})

app.listen(process.env.PORT, () => {
    console.log(chalk.bold.yellow('Server running on port ' + process.env.PORT));
})