import db from '../db.js';
async function validateUser(req, res, next) {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '');
    const session = await db.collection('session').findOne({token})
    if(!session) {
        return res.sendStatus(401)
    }
    res.locals.session = session
    next()
}

export default validateUser