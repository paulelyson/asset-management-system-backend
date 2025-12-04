import { Router, Request, Response } from 'express';
import Equipment from '../models/Equipment';
const router = Router();

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      let page = req.query.page ? Number(req.query.page) : 1;
      let limit = req.query.limit ? Number(req.query.limit) : 15;

      let result = await Equipment.find({})
        .skip(limit * (page - 1))
        .limit(limit)
        .lean();
      res.json({ data: result, message: 'Success getting equipment', success: true });
    })
    .catch((err) => {
      res.status(400).json({ data: null, message: err.message, success: false });
    })
);

export default router;
