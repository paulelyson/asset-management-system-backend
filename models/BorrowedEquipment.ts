import mongoose, { Schema, Types } from 'mongoose';
import { ConditionAndQuantitySchema, IConditionAndQuantity } from './Equipment';

export type BorrowedEquipmentStatus =
  | 'pending_faculty_approval'
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

export interface BorrowingDetails {
  borrower: Types.ObjectId;
  classDepartment: string;
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
  quantity: { type: Number, required: true },
  releasedQtyCond: { type: [ConditionAndQuantitySchema], default: [] },
  returnedQtyCond: { type: [ConditionAndQuantitySchema], default: [] },
  status: { type: String, required: true },
  remarks: { type: String, required: true },
});

const BorrowingDetailsSchema = new Schema<BorrowingDetails>(
  {
    borrower: { type: Schema.Types.ObjectId, required: true },
    classDepartment: { type: String, required: true },
    faculty: { type: Schema.Types.ObjectId, required: true },
    purpose: { type: String, required: true },
    classCode: { type: String, required: true },
    className: { type: String, required: true },
    dateOfUseStart: { type: Date, required: true },
    dateOfUseEnd: { type: Date, required: true },
    timeOfUseStart: { type: String, required: true },
    timeOfUseEnd: { type: String, required: true },
    borrowedEquipment: { type: [BorrowedEquipmentSchema], default: [] },
    dis: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);


export default mongoose.model('borrowedEquipment', BorrowingDetailsSchema);