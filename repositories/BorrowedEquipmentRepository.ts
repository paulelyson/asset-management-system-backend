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

    // 1️⃣ Sum quantities per status
    const reached = new Map<BorrowedEquipmentStatusType, number>();

    for (const tx of borrowedEquipmentStatus) {
      reached.set(tx.status, (reached.get(tx.status) ?? 0) + tx.quantity);
    }

    const cancelledQty = reached.get('cancelled') ?? 0;

    const result: { status: BorrowedEquipmentStatusType; quantity: number }[] = [];

    for (let i = 0; i < STATUS_FLOW.length; i++) {
      const status = STATUS_FLOW[i];
      const current = reached.get(status) ?? 0;
      if (!current) continue;

      // everything that progressed forward
      let progressed = 0;
      for (let j = i + 1; j < STATUS_FLOW.length; j++) {
        progressed += reached.get(STATUS_FLOW[j]) ?? 0;
      }

      let remaining = current - progressed;

      // cancellation only applies BEFORE release
      const isPreRelease = STATUS_FLOW.indexOf(status) < STATUS_FLOW.indexOf('released');

      if (isPreRelease) {
        remaining -= cancelledQty;
      }

      if (remaining > 0) {
        result.push({ status, quantity: remaining });
      }
    }

    // cancelled is always terminal
    if (cancelledQty > 0) {
      result.push({
        status: 'cancelled',
        quantity: cancelledQty,
      });
    }

    return result.filter((x) => x.quantity > 0);
  }
}

export default BorrowedEquipmentRepository;
