import { Router, Request, Response } from 'express';
import Equipment from '../models/Equipment';
const router = Router();

interface IEquipmentFilterQuery {
  name?: any;
}

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      let page = req.query.page ? Number(req.query.page) : 1;
      let limit = req.query.limit ? Number(req.query.limit) : 15;
      let { search } = req.query;
      let query: IEquipmentFilterQuery = {};
      if (search) query.name = { $regex: search, $options: 'i' };

      let result = await Equipment.find(query)
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
