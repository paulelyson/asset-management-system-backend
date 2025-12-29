import { Router, Request, Response } from 'express';
import Equipment from '../models/Equipment';
import EquipmentRepository from '../repositories/EquipmentRepository';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import { Department } from '../models/User';

interface IEquipmentFilterQuery {
  name?: any;
  department?: string;
}

const equipmentRepository = new EquipmentRepository();
const router = Router();

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

router.get('/categories', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      const department = (req.query.department as Department) ?? 'computer_engineering';
      const borrowedEquipments = await equipmentRepository.getCategories(department);
      res.json({ data: borrowedEquipments, message: 'Success getting equipment', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    })
);

export default router;
