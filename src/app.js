import express, { json } from 'express';
import cors from 'cors';
import chalk from 'chalk';

import authRouter from './routes/authRouter.js';
import crudRouter from './routes/crudRouter.js';
import userRouter from './routes/userRouter.js';
import validateUser from './middlewares/validateUser.js';

const app = express();
app.use(json());
app.use(cors());

app.use(authRouter)
app.use(validateUser, crudRouter)
app.use(validateUser, userRouter)

app.listen(process.env.PORT, () => {
    console.log(chalk.bold.yellow('Server running on port ' + process.env.PORT));
})