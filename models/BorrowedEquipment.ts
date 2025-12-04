import mongoose, { Schema, Types } from 'mongoose';
import { ConditionAndQuantitySchema, IConditionAndQuantity, IEquipment } from './Equipment';
import { Department, departments, IUser } from './User';

const validateTime = (time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
const minArrayLength = (min: number) => ({
  validator: (v: any) => Array.isArray(v) && v.length >= min,
  message: (v: any) => `Array must contain at least ${min} items.`,
});

const BORROWED_EQUIPMENT_STATUS: BorrowedEquipmentStatus[] = [
  'requested',
  'faculty_confirmed',
  'faculty_rejected',
  'oic_approved',
  'oic_rejected',
  'released',
  'pending_return',
  'returned',
  'unreturned',
  'system_reset',
];

export type BorrowedEquipmentStatus =
  | 'requested'
  | 'faculty_confirmed'
  | 'faculty_rejected'
  | 'oic_approved'
  | 'oic_rejected'
  | 'released'
  | 'pending_return'
  | 'returned'
  | 'unreturned'
  | 'system_reset';

interface IBorrowedEquipment {
  equipment: Types.ObjectId;
  quantity: number;
  releasedQtyCond: IConditionAndQuantity[];
  returnedQtyCond: IConditionAndQuantity[];
  status: BorrowedEquipmentStatus;
  remarks: string;
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

const BorrowedEquipmentSchema = new Schema<IBorrowedEquipment>({
  equipment: { type: Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true, min: 1 },
  releasedQtyCond: { type: [ConditionAndQuantitySchema], default: [] },
  returnedQtyCond: { type: [ConditionAndQuantitySchema], default: [] },
  status: { type: String, required: true, enum: BORROWED_EQUIPMENT_STATUS },
  remarks: { type: String, default: '' },
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
  releasedQtyCond: IConditionAndQuantity[];
  returnedQtyCond: IConditionAndQuantity[];
  status: BorrowedEquipmentStatus;
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
    releasedQtyCond: IConditionAndQuantity[],
    returnedQtyCond: IConditionAndQuantity[],
    status: BorrowedEquipmentStatus,
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
    this.releasedQtyCond = releasedQtyCond;
    this.returnedQtyCond = returnedQtyCond;
    this.status = status;
    this.remarks = remarks;
  }
}

export default mongoose.model('borrowedEquipment', BorrowingDetailsSchema);
