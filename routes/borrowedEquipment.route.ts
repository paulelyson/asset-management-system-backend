import { Router, Request, Response } from 'express';
import BorrowedEquipmentRepository from '../repositories/BorrowedEquipmentRepository';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import { ObjectId, Types } from 'mongoose';
import { BorrowedEquipmentStatus, BorrowedEquipmentStatusType, PREV_BORROWED_EQUIPMENT_STATUS } from '../models/BorrowedEquipment';
import { Department } from '../models/User';
import EquipmentRepository from '../repositories/EquipmentRepository';
import Equipment from '../models/Equipment';
import { IBorrowedEquipmentHistory } from '../models/BorrowedEquipmentHistory';
import { TokenData } from '../middlewares/authenticate.middleware';
import BorrowedEquipmentHistoryRepository from '../repositories/BorrowedEquipmentHistoryRepository';

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
const equipmentRepository = new EquipmentRepository();
const borrowedEquipmentHistoryRepository = new BorrowedEquipmentHistoryRepository();

router.get('/', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 15;
      const { search, purpose, status } = req.query;
      const query = {
        ...(search && { 'equipment.name': { $regex: search, $options: 'i' } }),
        ...(purpose && { purpose: purpose }),
        ...(status && { 'borrowedEquipmentStatus.status': status }),
      };
      return { query, page, limit, status };
    })
    .then(async (params) => {
      const { query, page, limit } = params;
      const borrowedEquipment = await borrowedEquipmentRepository.find(query, page, limit);
      return { borrowedEquipment, status: params.status };
    })
    .then((resp) => {
      let borrowedEquipment = resp.borrowedEquipment;

      if (resp.status) {
        borrowedEquipment = borrowedEquipmentRepository.filterByStatus(borrowedEquipment, resp.status as BorrowedEquipmentStatusType);
      }
      return borrowedEquipment;
    })
    .then((borrowedEquipment) => {
      // compute latest status
      const updated = borrowedEquipment.map((eqpmnt) => {
        const latestStatus = borrowedEquipmentRepository.getLatestStatus(eqpmnt.borrowedEquipmentStatus).map((x) => `${x.quantity} ${x.status}`);
        return { ...eqpmnt, latestStatus };
      });
      res.json({ data: updated, message: 'Success getting equipment', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    }),
);

router.get('/isrequested/:equipmentid', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      let isRequested: boolean = false;
      const equipmentId = new Types.ObjectId(req.params.equipmentid);
      const quantity = req.query.quantity ? Number(req.query.quantity) : 1;
      const equipment = await Equipment.findById(equipmentId);
      const borrowedEquipment = await borrowedEquipmentRepository.findByEquipmentId(equipmentId);
      if (borrowedEquipment.length && equipment) {
        const inCirculationStatus: BorrowedEquipmentStatusType[] = ['requested', 'faculty_approved', 'oic_approved', 'released', 'mark_returned'];
        const inCirculation: number = borrowedEquipmentRepository
          .getLatestStatus(borrowedEquipment[0].borrowedEquipmentStatus)
          .filter((x) => inCirculationStatus.includes(x.status))
          .map((x) => x.quantity)
          .reduce((acc, curr) => acc + curr, 0);
        isRequested = inCirculation >= equipment.totalQuantity;
      }

      if (isRequested) {
        throw new ErrorException(400, 'No more available units');
      }
      res.json({ data: borrowedEquipment, message: 'Success getting equipment', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    }),
);

router.get('/history', async (req: Request, res: Response) =>
  Promise.resolve()
    .then(async () => {
      const { borrowId, equipment } = req.query;
      if (!borrowId || !equipment) {
        throw new ErrorException(400, 'Missing query params');
      }
      const borrowObjectId = new Types.ObjectId(borrowId as string);
      const equipmentId = new Types.ObjectId(equipment as string);
      const histories = await borrowedEquipmentHistoryRepository.find(borrowObjectId, equipmentId);
      res.json({ data: histories, message: 'Success getting equipment', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    }),
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
        }),
      );
      return resp;
    })
    .then(async (resp) => {
      /**
       * add requested history
       */
      await Promise.all(
        resp.borrowedEquipment.map((eqpmnt) => {
          let history: IBorrowedEquipmentHistory = {
            borrowId: resp._id,
            equipment: eqpmnt.equipment,
            updatedStatus: 'requested',
            updatedConditionQuantity: {
              condition: 'functional',
              quantity: eqpmnt.quantity,
            },
            responsibleUser: (req.user as TokenData)._id,
            remarks: '',
            dis: true,
          };

          return borrowedEquipmentHistoryRepository.save(history);
        }),
      );
      res.json({ data: null, message: 'Success creating equipment', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    }),
);

router.patch('/updatestatus', (req: Request, res: Response) => {
  Promise.resolve()
    .then(async () => {
      /**
       * check if the update quantity > current quantity
       */

      const updatedEquipment = req.body as BorrowedEquipmentStatusExt[];
      const currentBorrowedEqpmnt = (
        await Promise.all(
          updatedEquipment.map((eqpmnt) => {
            const query = { _id: new Types.ObjectId(eqpmnt.id), 'equipment._id': new Types.ObjectId(eqpmnt.equipment) };
            return borrowedEquipmentRepository.find(query, 1, 1);
          }),
        )
      ).flat(1);
      const overQty = updatedEquipment.filter((eqpmnt) => {
        const current = currentBorrowedEqpmnt.find((x) => {
          return new Types.ObjectId(x.equipment._id).toString() == new Types.ObjectId(eqpmnt.equipment).toString();
        });
        if (current) {
          const prevStatus = PREV_BORROWED_EQUIPMENT_STATUS[eqpmnt.status];
          const currentStatus = borrowedEquipmentRepository
            .getLatestStatus(current?.borrowedEquipmentStatus)
            .find((x) => prevStatus.includes(x.status));
          return currentStatus ? eqpmnt.quantity > currentStatus.quantity : false;
        }
        return false;
      });
      if (overQty.length) {
        throw new ErrorException(400, 'Applied quantity is more than the limit.');
      }

      return updatedEquipment;
    })
    .then(async (updatedEquipment) => {
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
        }),
      );

      return updatedEquipment;
    })
    .then(async (resp) => {
      /**
       * add requested history
       */
      if (resp) {
        await Promise.all(
          resp.map((eqpmnt) => {
            if (eqpmnt) {
              let history: IBorrowedEquipmentHistory = {
                borrowId: eqpmnt.id,
                equipment: eqpmnt.equipment,
                updatedStatus: eqpmnt.status,
                updatedConditionQuantity: {
                  condition: eqpmnt.condition,
                  quantity: eqpmnt.quantity,
                },
                responsibleUser: (req.user as TokenData)._id,
                remarks: eqpmnt?.remarks ?? '',
                dis: true,
              };
              return borrowedEquipmentHistoryRepository.save(history);
            }
            return;
          }),
        );
      }

      res.json({ data: null, message: 'Success updating equipment status', success: true });
    })
    .catch((err: ErrorException) => {
      res.status(err.statusCode).json({ data: null, message: err.message, success: false });
    });
});

export default router;
