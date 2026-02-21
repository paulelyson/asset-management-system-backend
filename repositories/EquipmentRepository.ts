import { Types } from 'mongoose';
import Equipment, { IEquipment } from '../models/Equipment';
import { Department } from '../models/User';
import ErrorException from '../shared/exceptions/ErrorExceptions';

class EquipmentRepository {
  save = () => {};

  getCategories = async (distinct: string, query: any): Promise<string[]> =>
    Promise.resolve()
      .then(async () => {
        const result: string[] = await Equipment.find(query).distinct(distinct);
        return result;
      })
      .catch((err) => {
        throw new ErrorException(400, err.message);
      });

  update = (equipmentId: Types.ObjectId) =>
    Promise.resolve()
      .then(async () => {
        // return await Equipment.findOneAndUpdate({ _id: equipmentId }, { $set: { ...data } }, { runValidators: true, new: false });
      })
      .catch((err) => {
        throw new ErrorException(400, err.message);
      });

  findById = (equipmentId: Types.ObjectId): Promise<IEquipment> =>
    Promise.resolve()
      .then(async () => {
        let result = await Equipment.findById(equipmentId).lean();
        if (!result) {
          throw new Error('Equipment not found');
        }
        return result;
      })
      .catch((err) => {
        throw new ErrorException(400, err.message);
      });

  getChangeValues = (oldData: IEquipment, updatedData: IEquipment) => {
    const exemptions = ['_id', 'updatedAt'];
    return Object.entries(oldData)
      .map(([key, oldVal]) => {
        const updatedValue = updatedData[key as keyof IEquipment];
        if (!exemptions.includes(key) && updatedValue !== oldVal) {
          return {
            key: key,
            old: oldVal,
            updated: updatedValue,
          };
        }
        return;
      })
      .filter((x) => x);
  };
}

export default EquipmentRepository;
