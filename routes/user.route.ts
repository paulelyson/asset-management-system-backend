import { Router, Request, Response } from 'express';
import ErrorException from '../shared/exceptions/ErrorExceptions';
const router = Router();

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      res.json({ data: null, message: 'Success getting users', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    })
);

export default router;
