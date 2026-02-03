import { Types } from 'mongoose';
import { IBorrowedEquipmentHistory } from '../models/BorrowedEquipmentHistory';
import BorrowedEquipmentHistory from '../models/BorrowedEquipmentHistory';
import ErrorException from '../shared/exceptions/ErrorExceptions';

class BorrowedEquipmentHistoryRepository {
  save = async (history: IBorrowedEquipmentHistory) =>
    Promise.resolve()
      .then(async () => {
        const data = new BorrowedEquipmentHistory(history);
        await data.save();
      })
      .catch((err) => {
        console.log(err);
        const errors: string[] = Object.values(err.errors).map((e: any) => e?.properties?.message);
        throw new ErrorException(400, err._message, errors);
      });

  find = async (borrowId: Types.ObjectId, equipment: Types.ObjectId) =>
    Promise.resolve()
      .then(async () => {
        let populateQuery = [{ path: 'responsibleUser', select: 'schoolId firstName lastName department' }];
        return await BorrowedEquipmentHistory.find({ borrowId, equipment }).populate(populateQuery).sort({ updatedAt: -1 }).lean();
      })
      .catch((err) => {
        const errors: string[] = Object.values(err.errors).map((e: any) => e?.properties?.message);
        throw new ErrorException(400, err._message, errors);
      });
}

export default BorrowedEquipmentHistoryRepository;
