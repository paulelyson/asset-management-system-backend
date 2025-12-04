import mongoose, { Schema, Types } from 'mongoose';
import { IConditionAndQuantity } from './Equipment';
import { BorrowedEquipmentStatus } from './BorrowedEquipment';

export interface IBorrowedEquipmentHistory {
  borrowId: Types.ObjectId;
  equipment: Types.ObjectId;
  updatedStatus: BorrowedEquipmentStatus;
  updatedConditionQuantity: IConditionAndQuantity;
  responsibleUser: Types.ObjectId;
  remarks: string;
  dis: boolean;
}

const BorrowedEquipmentHistorySchema = new Schema<IBorrowedEquipmentHistory>({
  borrowId: { type: Schema.Types.ObjectId, required: true },
  equipment: { type: Schema.Types.ObjectId, required: true },
  updatedStatus: { type: String, required: true },
  updatedConditionQuantity: { type: String, required: true },
  responsibleUser: { type: Schema.Types.ObjectId, required: true },
  remarks: { type: String, required: true },
  dis: { type: Boolean, required: true, default: true },
});

export default mongoose.model('borrowedEquipmentHistory', BorrowedEquipmentHistorySchema);
