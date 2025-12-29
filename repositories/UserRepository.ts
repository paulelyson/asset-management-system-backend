import User, { IUser } from '../models/User';
import ErrorException from '../shared/exceptions/ErrorExceptions';



class UserRepository {
  save = () => {};

  find = (): Promise<IUser[]> =>
    Promise.resolve()
      .then(async () => {
        return await User.find({}).lean()
      })
      .catch((err: ErrorException) => {
        throw new ErrorException(400, err.message);
      });
}

export default UserRepository;
