import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      res.json({ data: [], message: 'Success getting daily attendance', success: true });
    })
    .catch((err) => {
      res.status(400).json({ data: null, message: err.message, success: false });
    })
);

export default router;
