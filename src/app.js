import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import joi from 'joi';
import chalk from 'chalk';

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
        res.sendStatus(200)
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
            await db.collection('session').insertOne({ userId: validUser._id, token })
            res.status(200).send(token)
        } else {
            res.status(422).send(`Usuário ou senha inválidos`)
        }   
    } catch (error) {
        res.sendStatus(500)
    }
})

app.listen(5000, () => {
    console.log(chalk.bold.yellow('Server running on port 5000'));
})