import BorrowedEquipment, { IBorrowingDetails, BorrowedEqpmnt, BorrowedEquipmentStatus } from '../models/BorrowedEquipment';
import ErrorException from '../shared/exceptions/ErrorExceptions';
import { GetBorrowedEquipmentAggregate } from '../shared/aggregations/BorrowedEquipment.aggregate';
import { Types } from 'mongoose';

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

  find = async (): Promise<BorrowedEqpmnt[]> =>
    Promise.resolve()
      .then(async () => {
        const aggregateQuery = GetBorrowedEquipmentAggregate();
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
        await BorrowedEquipment.findOneAndUpdate(query, { $push: { 'borrowedEquipment.$.borrowedEquipmentStatus': status } });
      })
      .catch((err) => {
        throw new ErrorException(400, err.message);
      });

  findById = async () => {};
}

export default BorrowedEquipmentRepository;
