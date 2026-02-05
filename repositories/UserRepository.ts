import User, { IUser } from '../models/User';
import ErrorException from '../shared/exceptions/ErrorExceptions';

class UserRepository {
  save = () => {};

  find = (query: any): Promise<IUser[]> =>
    Promise.resolve()
      .then(async () => {
        return await User.find(query).lean();
      })
      .catch((err: ErrorException) => {
        throw new ErrorException(400, err.message);
      });
  
  findOne = (query: any): Promise<IUser | null> =>
    Promise.resolve()
      .then(async () => {
        return await User.findOne(query).lean();
      })
      .catch((err: ErrorException) => {
        throw new ErrorException(400, err.message);
      });
}

export default UserRepository;
