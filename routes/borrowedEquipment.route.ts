import { Router, Request, Response } from 'express';
import BorrowedEquipmentRepository from '../repositories/BorrowedEquipmentRepository';
const router = Router();
const borrowedEquipmentRepository = new BorrowedEquipmentRepository();

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {})
    .catch((err: ErrorException) => {})
);

router.post('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      await borrowedEquipmentRepository.save(req.body);
      res.json({ data: null, message: 'Success creating equipment', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    })
);

export default router;
