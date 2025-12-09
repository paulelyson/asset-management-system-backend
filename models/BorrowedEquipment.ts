import mongoose, { Schema, Types } from 'mongoose';
import { ConditionAndQuantitySchema, EQUIPMENT_CONDITION, IConditionAndQuantity, IEquipment } from './Equipment';
import { Department, departments, IUser } from './User';

const validateTime = (time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
const minArrayLength = (min: number) => ({
  validator: (v: any) => Array.isArray(v) && v.length >= min,
  message: (v: any) => `Array must contain at least ${min} items.`,
});

const BORROWED_EQUIPMENT_STATUS: BorrowedEquipmentStatusType[] = [
  'requested',
  'faculty_approved',
  'faculty_rejected',
  'oic_approved',
  'oic_rejected',
  'released',
  'mark_returned',
  'returned',
  'unreturned',
  'system_reset',
];

export type BorrowedEquipmentStatusType =
  | 'requested'
  | 'faculty_approved'
  | 'faculty_rejected'
  | 'oic_approved'
  | 'oic_rejected'
  | 'released'
  | 'mark_returned'
  | 'returned'
  | 'unreturned'
  | 'system_reset';

export interface BorrowedEquipmentStatus extends IConditionAndQuantity {
  status: BorrowedEquipmentStatusType;
  remarks?: string;
}

interface IBorrowedEquipment {
  _id?: Types.ObjectId;
  equipment: Types.ObjectId;
  quantity: number;
  borrowedEquipmentStatus: BorrowedEquipmentStatus[];
}

export interface IBorrowingDetails {
  borrower: Types.ObjectId;
  classDepartment: Department;
  faculty: Types.ObjectId;
  purpose: string;
  classCode: string;
  className: string;
  dateOfUseStart: Date;
  dateOfUseEnd: Date;
  timeOfUseStart: string;
  timeOfUseEnd: string;
  borrowedEquipment: IBorrowedEquipment[];
  dis: boolean;
}

const BorrowedEquipmentStatusSchema = new Schema<BorrowedEquipmentStatus>(
  {
    quantity: { type: Number, required: true },
    condition: { type: String, required: true, enum: EQUIPMENT_CONDITION },
    status: { type: String, required: true, enum: BORROWED_EQUIPMENT_STATUS },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

const BorrowedEquipmentSchema = new Schema<IBorrowedEquipment>({
  equipment: { type: Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true, min: 1 },
  borrowedEquipmentStatus: { type: [BorrowedEquipmentStatusSchema], default: [] },
});

const BorrowingDetailsSchema = new Schema<IBorrowingDetails>(
  {
    borrower: { type: Schema.Types.ObjectId, required: true },
    classDepartment: { type: String, required: true, enum: departments },
    faculty: { type: Schema.Types.ObjectId, required: true },
    purpose: { type: String, required: true },
    classCode: { type: String, required: true },
    className: { type: String, required: true },
    dateOfUseStart: { type: Date, required: true },
    dateOfUseEnd: { type: Date, required: true },
    timeOfUseStart: { type: String, required: true, validate: validateTime },
    timeOfUseEnd: { type: String, required: true, validate: validateTime },
    borrowedEquipment: { type: [BorrowedEquipmentSchema], default: [], validate: minArrayLength(1) },
    dis: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export class BorrowedEqpmnt {
  borrower: IUser;
  classDepartment: Department;
  faculty: IUser;
  purpose: string;
  classCode: string;
  className: string;
  dateOfUseStart: Date;
  dateOfUseEnd: Date;
  timeOfUseStart: string;
  timeOfUseEnd: string;
  equipment: IEquipment;
  quantity: number;
  borrowedEquipmentStatus: BorrowedEquipmentStatus[];
  remarks: string;

  constructor(
    borrower: IUser,
    classDepartment: Department,
    faculty: IUser,
    purpose: string,
    classCode: string,
    className: string,
    dateOfUseStart: Date,
    dateOfUseEnd: Date,
    timeOfUseStart: string,
    timeOfUseEnd: string,
    equipment: IEquipment,
    quantity: number,
    borrowedEquipmentStatus: BorrowedEquipmentStatus[],
    remarks: string
  ) {
    this.borrower = borrower;
    this.classDepartment = classDepartment;
    this.faculty = faculty;
    this.purpose = purpose;
    this.classCode = classCode;
    this.className = className;
    this.dateOfUseStart = dateOfUseStart;
    this.dateOfUseEnd = dateOfUseEnd;
    this.timeOfUseStart = timeOfUseStart;
    this.timeOfUseEnd = timeOfUseEnd;
    this.equipment = equipment;
    this.quantity = quantity;
    this.borrowedEquipmentStatus = borrowedEquipmentStatus;
    this.remarks = remarks;
  }
}

export default mongoose.model('borrowedEquipment', BorrowingDetailsSchema);
