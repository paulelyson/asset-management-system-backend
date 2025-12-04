import BorrowedEquipment, { BorrowingDetails } from '../models/BorrowedEquipment';

class BorrowedEquipmentRepository {
  save = async (borrowedEquipment: BorrowingDetails) =>
    Promise.resolve()
      .then(async () => {
        const data = new BorrowedEquipment(borrowedEquipment);
        await data.save();
      })
      .catch((err) => {
        console.log(err);
        throw new ErrorException(400);
      });
}

export default BorrowedEquipmentRepository;
