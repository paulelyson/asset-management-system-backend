import mongoose, { Schema, Types } from 'mongoose';
import { ConditionAndQuantitySchema, IConditionAndQuantity } from './Equipment';
import { BorrowedEquipmentStatusType } from './BorrowedEquipment';

export interface IBorrowedEquipmentHistory {
  borrowId: Types.ObjectId;
  equipment: Types.ObjectId;
  updatedStatus: BorrowedEquipmentStatusType;
  updatedConditionQuantity: IConditionAndQuantity;
  responsibleUser: Types.ObjectId;
  remarks: string;
  dis: boolean;
}

const BorrowedEquipmentHistorySchema = new Schema<IBorrowedEquipmentHistory>({
  borrowId: { type: Schema.Types.ObjectId, required: true },
  equipment: { type: Schema.Types.ObjectId, required: true },
  updatedStatus: { type: String, required: true },
  updatedConditionQuantity: { type: ConditionAndQuantitySchema, required: true },
  responsibleUser: { type: Schema.Types.ObjectId, required: true },
  remarks: { type: String },
  dis: { type: Boolean, required: true, default: true },
});

export default mongoose.model('borrowedEquipmentHistory', BorrowedEquipmentHistorySchema);
