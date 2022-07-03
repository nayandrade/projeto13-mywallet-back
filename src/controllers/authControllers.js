import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import joi from 'joi';
import db from '../db.js';

export async function signup(req, res) {
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
}

export async function signin(req, res) {
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
}