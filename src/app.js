import express, { json } from 'express';
import cors from 'cors';
import chalk from 'chalk';
import { getTransaction, postTransaction } from './controllers/crudControllers.js';
import { signin, signup } from './controllers/authControllers.js';
import { deleteSession } from './controllers/userControllers.js';

const app = express();
app.use(json());
app.use(cors());

app.post('/signup', signup)
app.post('/signin', signin)
app.post('/transaction', postTransaction)
app.get('/transaction', getTransaction)
app.delete('/session', deleteSession)

app.listen(process.env.PORT, () => {
    console.log(chalk.bold.yellow('Server running on port ' + process.env.PORT));
})