import { Router, Request, Response } from 'express';
import BorrowedEquipmentRepository from '../repositories/BorrowedEquipmentRepository';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import { Types } from 'mongoose';
import { BorrowedEquipmentStatus } from '../models/BorrowedEquipment';
const router = Router();
const borrowedEquipmentRepository = new BorrowedEquipmentRepository();

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      const borrowedEquipments = await borrowedEquipmentRepository.find();
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
          let status: BorrowedEquipmentStatus = {
            quantity: eqpmnt.quantity,
            status: 'requested',
            condition: 'functional',
          };
          borrowedEquipmentRepository.updateBorrowedEquipmentStatus(id, equipment, status);
        })
      );

      res.json({ data: null, message: 'Success creating equipment', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    })
);

export default router;
