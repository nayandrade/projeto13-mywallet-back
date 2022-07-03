import joi from 'joi';

export function validateJoiSignup(req, res, next) {
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
    res.locals.user = user
    next()
}

export function validateJoiSignin(req, res, next) {
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
    next()
}

export function validateJoiPostTransaction(req, res, next) {
    const transaction = req.body
    const transactionSchema = joi.object({
        value: joi.number().required(),
        description: joi.string().required(),
    })
    const { error } = transactionSchema.validate(transaction)
    if (error) {
        return res.status(422).send(`dados da transação incorretos`)
    }
    next()
}

