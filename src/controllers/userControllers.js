import db from '../db.js';

export async function deleteSession(req, res) {
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
}