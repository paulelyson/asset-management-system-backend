import { Router, Request, Response } from 'express';
import Equipment, { IEquipment } from '../models/Equipment';
import EquipmentRepository from '../repositories/EquipmentRepository';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import { Department } from '../models/User';
import BorrowedEquipmentRepository from '../repositories/BorrowedEquipmentRepository';
import { BorrowedEquipmentStatusType } from '../models/BorrowedEquipment';

export interface IEquipmentFilterQuery {
  name?: any;
  department?: string;
  search?: string;
  categories?: string;
  brand?: string;
  equipmentType?: string;
}

const equipmentRepository = new EquipmentRepository();
const borrowedEquipmentRepository = new BorrowedEquipmentRepository();
const router = Router();

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      let page = req.query.page ? Number(req.query.page) : 1;
      let limit = req.query.limit ? Number(req.query.limit) : 15;
      let borrow = Boolean(req.query.borrow) ?? false;

      let { search, department, categories, brand, equipmentType } = req.query;

      const query = {
        ...(search && { name: { $regex: search, $options: 'i' } }),
        ...(department && { department }),
        ...(categories && { categories }),
        ...(brand && { brand }),
        ...(equipmentType && { equipmentType }),
      };

      let equipment = await Equipment.find(query)
        .skip(limit * (page - 1))
        .limit(limit)
        .lean();

      return { equipment, borrow };
    })
    .then(async (params) => {
      // if borrowed calculate quantity in the circulation
      let updated: IEquipment[] = params.equipment;
      if (params.borrow) {
        updated = await Promise.all(
          params.equipment.map(async (eqpmnt) => {
            const query = { 'equipment._id': eqpmnt._id };
            const borrowedEquipment = await borrowedEquipmentRepository.find(query, 1, 10);
            let totalQty = eqpmnt.totalQuantity;
            if (borrowedEquipment.length) {
              const inCirculationStatus: BorrowedEquipmentStatusType[] = [
                'requested',
                'faculty_approved',
                'oic_approved',
                'released',
                'mark_returned',
              ];
              const inCirculation: number = borrowedEquipmentRepository
                .getCurrentStatus(borrowedEquipment[0].borrowedEquipmentStatus)
                .filter((x) => inCirculationStatus.includes(x.status))
                .map((x) => x.quantity)
                .reduce((acc, curr) => acc + curr, 0);
              totalQty = totalQty - inCirculation;
            }
            return { ...eqpmnt, totalQuantity: totalQty };
          })
        );
      }
      res.json({ data: updated, message: 'Success getting equipment', success: true });
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
