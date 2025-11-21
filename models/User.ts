import mongoose, { Schema } from 'mongoose';

type Department =
  | 'civil_engineering'
  | 'computer_engineering'
  | 'electrical_engineering'
  | 'electronics_and_communications_engineering'
  | 'industrial_engineering'
  | 'mechanical_engineering'
  | 'dmsep'
  | 'ecl';

type UserRole = 'administrator' | 'chairman' | 'oic' | 'faculty' | 'reads' | 'student';

type UserStatus = 'pending_approval' | 'active' | 'deactivated' | 'rejected';

const departments: string[] = [
  'civil_engineering',
  'computer_engineering',
  'electrical_engineering',
  'electronics_and_communications_engineering',
  'industrial_engineering',
  'mechanical_engineering',
  'dmsep',
  'ecl',
];

const userRoles = ['administrator', 'chairman', 'oic', 'faculty', 'reads', 'student'];

const userStatus = ['pending_approval', 'active', 'deactivated', 'rejected'];

interface IUser {
  firstName: string;
  middleName: string;
  lastName: string;
  age: number;
  email: string;
  schoolId: string;
  department: Department[];
  role: UserRole[];
  password: string;
  activated: boolean;
  account_status: UserStatus;
  dis: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true, default: 0 },
    email: { type: String, required: true },
    schoolId: { type: String, required: true },
    department: { type: [String], required: true, enum: departments },
    role: { type: [String], required: true, enum: userRoles },
    password: { type: String, required: true },
    activated: { type: Boolean, required: true, default: false },
    account_status: { type: String, required: true, enum: userStatus },
    dis: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('user', UserSchema);
