import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE = process.env.DATABASE || 'mongodb://127.0.0.1:27017/usjr_ams_local';

app.get('/', (req: Request, res: Response) => {
  res.send('Success get');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});