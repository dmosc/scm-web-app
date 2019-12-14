import express, {Router} from 'express';
import cors from 'cors';

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

//Routes
app.use('/', Router());

export default app;
