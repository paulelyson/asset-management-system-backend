import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE = process.env.DATABASE || 'mongodb://127.0.0.1:27017/usjr_ams_local';

/**
 * routes import
 */
import EquipmentRoute from './routes/equipment.route';
import BorrowedEquipment from './routes/borrowedEquipment.route';
import UserRoute from './routes/user.route';
import { authenticate } from './middlewares/authenticate.middleware';

/**
 * middlewares
 */

app.use(express.json());
app.use(cors());

/**
 * routes
 */
app.use('/api/equipment', EquipmentRoute);
app.use('/api/borrowequipment', authenticate, BorrowedEquipment);
app.use('/api/user', UserRoute);

/**
 * connect to database
 */

Promise.resolve()
  .then(() => {
    mongoose.set('strictQuery', true);
    mongoose.connect(DATABASE);
    console.log('database connected');
  })
  .catch((err: Error) => {
    throw err;
  });

app.get('/', (req: Request, res: Response) => {
  res.send('Success get');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
