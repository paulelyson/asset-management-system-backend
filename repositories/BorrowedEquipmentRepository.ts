import BorrowedEquipment, {
  IBorrowingDetails,
  BorrowedEqpmnt,
  BorrowedEquipmentStatus,
  BorrowedEquipmentStatusType,
} from '../models/BorrowedEquipment';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import { GetBorrowedEquipmentAggregate } from '../shared/aggregations/BorrowedEquipment.aggregate';
import { ObjectId, Types } from 'mongoose';

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

  find = async (query: any, page: number, limit: number, _sort: number = 1): Promise<BorrowedEqpmnt[]> =>
    Promise.resolve()
      .then(async () => {
        const aggregateQuery = GetBorrowedEquipmentAggregate(query, page, limit);
        const result: BorrowedEqpmnt[] = await BorrowedEquipment.aggregate(aggregateQuery);
        return result;
      })
      .catch((err) => {
        throw new ErrorException(400, err.message);
      });

  updateBorrowedEquipmentStatus = async (
    _id: Types.ObjectId,
    equipment: Types.ObjectId,
    status: BorrowedEquipmentStatus,
  ): Promise<IBorrowingDetails | null> =>
    Promise.resolve()
      .then(async () => {
        const query = { _id: _id, 'borrowedEquipment.equipment': equipment };
        return await BorrowedEquipment.findOneAndUpdate(
          query,
          { $push: { 'borrowedEquipment.$.borrowedEquipmentStatus': status } },
          { runValidators: true, new: true },
        );
      })
      .catch((err) => {
        throw new ErrorException(400, err.message);
      });

  // this is use if the borrowed equipment api if it has status filter
  filterByStatus = (borrowedEquipment: BorrowedEqpmnt[], status: BorrowedEquipmentStatusType) => {
    return borrowedEquipment.filter((eqpmnt) => {
      return this.getLatestStatus(eqpmnt.borrowedEquipmentStatus)
        .map((x) => x.status)
        .includes(status);
    });
  };

  findByEquipmentId = async (equipmentId: Types.ObjectId, page: number = 1, limit: number = 15, _sort: number = 1) =>
    Promise.resolve()
      .then(async () => {
        const query = { 'equipment._id': equipmentId };
        const result: BorrowedEqpmnt[] = await this.find(query, page, limit);
        return result;
      })
      .catch((err) => {
        throw new ErrorException(400, err.message);
      });

  getLatestStatus(borrowedEquipmentStatus: BorrowedEquipmentStatus[]) {
    if (!borrowedEquipmentStatus?.length) return [];

    // 1️⃣ cumulative reached per status (use MAX)
    const reached = new Map<BorrowedEquipmentStatusType, number>();

    for (const tx of borrowedEquipmentStatus) {
      reached.set(tx.status, Math.max(reached.get(tx.status) ?? 0, tx.quantity));
    }

    const result: { status: BorrowedEquipmentStatusType; quantity: number }[] = [];

    // 2️⃣ subtract the NEXT EXISTING downstream status
    for (let i = 0; i < STATUS_FLOW.length; i++) {
      const status = STATUS_FLOW[i];
      const currentReached = reached.get(status);
      if (!currentReached) continue;

      let nextReached = 0;

      // 🔑 find the nearest downstream status that exists
      for (let j = i + 1; j < STATUS_FLOW.length; j++) {
        const candidate = reached.get(STATUS_FLOW[j]);
        if (candidate !== undefined) {
          nextReached = candidate;
          break;
        }
      }

      const quantity = currentReached - nextReached;

      if (quantity > 0) {
        result.push({ status, quantity });
      }
    }
    console.log({ result });
    return result.filter((x) => x.quantity > 0);
  }
}

export default BorrowedEquipmentRepository;
