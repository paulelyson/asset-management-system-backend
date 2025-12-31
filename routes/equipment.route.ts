import { Router, Request, Response } from 'express';
import Equipment from '../models/Equipment';
import EquipmentRepository from '../repositories/EquipmentRepository';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import { Department } from '../models/User';

export interface IEquipmentFilterQuery {
  name?: any;
  department?: string;
  search?: string;
  categories?: string;
  brand?: string;
  equipmentType?: string;
}

const equipmentRepository = new EquipmentRepository();
const router = Router();

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      let page = req.query.page ? Number(req.query.page) : 1;
      let limit = req.query.limit ? Number(req.query.limit) : 15;
      let { search, department, categories, brand, equipmentType } = req.query;

      const query = {
        ...(search && { name: { $regex: search, $options: 'i' } }),
        ...(department && { department }),
        ...(categories && { categories }),
        ...(brand && { brand }),
        ...(equipmentType && { equipmentType }),
      };

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

router.get('/distinct', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      let query: IEquipmentFilterQuery = {};
      const department = req.query.department as Department;
      const field = req.query.field as string;
      if (department) query.department = department;
      const borrowedEquipments = await equipmentRepository.getCategories(field, query);
      res.json({ data: borrowedEquipments, message: 'Success getting equipment', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    })
);

export default router;
