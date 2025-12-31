import Equipment from '../models/Equipment';
import { Department } from '../models/User';
import ErrorException from '../shared/exceptions/ErrorExceptions';

class EquipmentRepository {
  save = () => {};

  getCategories = async ( distinct: string, query: any): Promise<string[]> =>
    Promise.resolve()
      .then(async () => {
        const result: string[] = await Equipment.find(query).distinct(distinct);
        return result;
      })
      .catch((err) => {
        throw new ErrorException(400, err.message);
      });
}

export default EquipmentRepository;
