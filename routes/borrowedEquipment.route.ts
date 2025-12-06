import { Router, Request, Response } from 'express';
import BorrowedEquipmentRepository from '../repositories/BorrowedEquipmentRepository';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import { Types } from 'mongoose';
import { BorrowedEquipmentStatus } from '../models/BorrowedEquipment';

interface BorrowedEquipmentStatusExt extends BorrowedEquipmentStatus {
  id: Types.ObjectId;
  equipment:  Types.ObjectId;
}

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
