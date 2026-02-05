import { Router, Request, Response } from 'express';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import UserRepository from '../repositories/UserRepository';
import { generateToken } from '../middlewares/authenticate.middleware';

const userRepository = new UserRepository();
const router = Router();

router.post('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      let { schoolId, password } = req.body;
      let query = { schoolId, password };
      const user = await userRepository.findOne(query);
      if (!user) {
        throw new ErrorException(400, 'Invalid Credentials');
      }

      const data = {
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        department: user.department,
        assignedTo: user.assignedTo,
      };
      const token = generateToken(data);

      res.json({ data: token, message: 'Success getting users', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    }),
);

export default router;
