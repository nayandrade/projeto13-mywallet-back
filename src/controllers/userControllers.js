import db from '../db.js';
export async function deleteSession(req, res) {
    const session = res.locals.session
    try {
        const userId = session.userId
        const logoutUser = await db.collection('session').deleteMany({userId});
        res.status(200).send(`usuário desconectado ${session.token}`);
    } catch (error) {
        res.status(500).send();
    }
}