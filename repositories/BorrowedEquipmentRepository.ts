import BorrowedEquipment, {
  IBorrowingDetails,
  BorrowedEqpmnt,
  BorrowedEquipmentStatus,
  BorrowedEquipmentStatusType,
} from '../models/BorrowedEquipment';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import { GetBorrowedEquipmentAggregate } from '../shared/aggregations/BorrowedEquipment.aggregate';
import { Types } from 'mongoose';

const STATUS_FLOW: BorrowedEquipmentStatusType[] = ['requested', 'faculty_approved', 'oic_approved', 'released', 'mark_returned', 'returned'];

class BorrowedEquipmentRepository {
  save = async (borrowedEquipment: IBorrowingDetails) =>
    Promise.resolve()
      .then(async () => {
        const data = new BorrowedEquipment(borrowedEquipment);
        return await data.save();
      })
      .catch((err) => {
        const errors: string[] = Object.values(err.errors).map((e: any) => e?.properties?.message);
        throw new ErrorException(400, err.message, errors);
      });

  find = async (query: any, page: number, limit: number): Promise<BorrowedEqpmnt[]> =>
    Promise.resolve()
      .then(async () => {
        const aggregateQuery = GetBorrowedEquipmentAggregate(query, page, limit);
        const result: BorrowedEqpmnt[] = await BorrowedEquipment.aggregate(aggregateQuery);
        return result;
      })
      .catch((err) => {
        throw new ErrorException(400, err.message);
      });

  updateBorrowedEquipmentStatus = async (_id: Types.ObjectId, equipment: Types.ObjectId, status: BorrowedEquipmentStatus) =>
    Promise.resolve()
      .then(async () => {
        const query = { _id: _id, 'borrowedEquipment.equipment': equipment };
        await BorrowedEquipment.findOneAndUpdate(
          query,
          { $push: { 'borrowedEquipment.$.borrowedEquipmentStatus': status } },
          { runValidators: true, new: true }
        );
      })
      .catch((err) => {
        throw new ErrorException(400, err.message);
      });

  filterByStatus = (borrowedEquipment: BorrowedEqpmnt[], status: BorrowedEquipmentStatusType) => {
   return borrowedEquipment.filter((eqpmnt) => {
      return this.getCurrentStatus(eqpmnt.borrowedEquipmentStatus).includes(status);
    });
  };

  findById = async () => {};

  getCurrentStatus(borrowedEquipmentStatus: BorrowedEquipmentStatus[]): BorrowedEquipmentStatusType[] {
    // 1️⃣ Sum quantities per status (event-based accumulation)
    const reached = new Map<BorrowedEquipmentStatusType, number>();
    for (const tx of borrowedEquipmentStatus) {
      reached.set(tx.status, (reached.get(tx.status) ?? 0) + tx.quantity);
    }
    // 2️⃣ Compute remaining count per status
    const result: { status: BorrowedEquipmentStatusType; quantity: number }[] = [];
    for (let i = 0; i < STATUS_FLOW.length; i++) {
      const status = STATUS_FLOW[i];
      const current = reached.get(status) ?? 0;
      if (!current) continue;

      // subtract everything that moved beyond this status
      let progressed = 0;
      for (let j = i + 1; j < STATUS_FLOW.length; j++) {
        progressed += reached.get(STATUS_FLOW[j]) ?? 0;
      }
      const remaining = current - progressed;
      if (remaining > 0) {
        result.push({ status, quantity: remaining });
      }
    }

    return result.map((x) => x.status);
  }
}

export default BorrowedEquipmentRepository;
