import { Router, Request, Response } from 'express';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import UserRepository from '../repositories/UserRepository';

const userRepository = new UserRepository();
const router = Router();

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      let page = req.query.page ? Number(req.query.page) : 1;
      let limit = req.query.limit ? Number(req.query.limit) : 15;

      let users = await userRepository.find({});
      res.json({ data: users, message: 'Success getting users', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    })
);

export default router;
