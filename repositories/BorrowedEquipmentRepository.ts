import BorrowedEquipment, { BorrowingDetails } from '../models/BorrowedEquipment';
import ErrorException from '../shared/exceptions/ErrorExceptions';

class BorrowedEquipmentRepository {
  save = async (borrowedEquipment: BorrowingDetails) =>
    Promise.resolve()
      .then(async () => {
        const data = new BorrowedEquipment(borrowedEquipment);
        await data.save();
      })
      .catch((err) => {
        const errors: string[] = Object.values(err.errors).map((e: any) => e?.properties?.message);
        console.log(errors);
        throw new ErrorException(400, err._message, errors);
      });
}

export default BorrowedEquipmentRepository;
