import { Router, Request, Response } from 'express';
import BorrowedEquipmentRepository from '../repositories/BorrowedEquipmentRepository';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import { Types } from 'mongoose';
import { BorrowedEquipmentStatus, BorrowedEquipmentStatusType } from '../models/BorrowedEquipment';
import { Department } from '../models/User';

interface BorrowedEquipmentStatusExt extends BorrowedEquipmentStatus {
  id: Types.ObjectId;
  equipment: Types.ObjectId;
}

interface IBorrowedEquipmentStatusFilter {
  borrower?: Types.ObjectId;
  faculty?: Types.ObjectId;
  department?: Department;
  className?: string;
  purpose?: string;
  status?: BorrowedEquipmentStatusType;
}

const router = Router();
const borrowedEquipmentRepository = new BorrowedEquipmentRepository();

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 15;
      const { search, purpose } = req.query;
      const query = {
        ...(search && { 'equipment.name': { $regex: search, $options: 'i' } }),
        ...(purpose && { purpose: purpose }),
      };
      return { query, page, limit };
    })
    .then(async (params) => {
      const { query, page, limit } = params;
      const borrowedEquipments = await borrowedEquipmentRepository.find(query, page, limit);
      res.json({ data: borrowedEquipments, message: 'Success getting equipment', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    })
);

router.post('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      return await borrowedEquipmentRepository.save(req.body);
    })
    .then(async (resp) => {
      /**
       * add requested status
       */
      await Promise.all(
        resp.borrowedEquipment.map((eqpmnt) => {
          let id = resp._id;
          let equipment = eqpmnt.equipment;
          let status: BorrowedEquipmentStatus = { quantity: eqpmnt.quantity, status: 'requested', condition: 'functional' };
          return borrowedEquipmentRepository.updateBorrowedEquipmentStatus(id, equipment, status);
        })
      );

      res.json({ data: null, message: 'Success creating equipment', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    })
);

router.patch('/updatestatus', (req: Request, res: Response) => {
  Promise.resolve()
    .then(async () => {
      const updatedEquipment = req.body as BorrowedEquipmentStatusExt[];
      await Promise.all(
        updatedEquipment.map((eqpmnt: BorrowedEquipmentStatusExt) => {
          const id = eqpmnt.id;
          const equipment = eqpmnt.equipment;
          const status: BorrowedEquipmentStatus = {
            quantity: eqpmnt.quantity,
            status: eqpmnt.status,
            condition: eqpmnt.condition,
            remarks: eqpmnt?.remarks,
          };

          return borrowedEquipmentRepository.updateBorrowedEquipmentStatus(id, equipment, status);
        })
      );
      res.json({ data: null, message: 'Success updating equipment status', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    });
});

export default router;
