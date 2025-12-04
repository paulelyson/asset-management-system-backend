import mongoose, { Schema } from 'mongoose';
import { Department, departments } from './User';

type EquipmentCondition = 'functional' | 'defective' | 'obsolete' | 'lost' | 'for_checkup' | 'turned_over';
type EquipmentStatus = 'acquired' | 'returned';
type EquipmentAvailability = 'available' | 'borrowed' | 'unreturned';
type EquipmentInventoryType = 'inventory' | 'non_inventory';
type Matter = 'solid' | 'liquid' | 'gas';

const equipmentCondition: EquipmentCondition[] = ['functional', 'defective', 'obsolete', 'lost', 'for_checkup', 'turned_over'];
const equipmentStatus: EquipmentStatus[] = ['acquired', 'returned'];

export interface IConditionAndQuantity {
  condition: EquipmentCondition;
  quantity: number;
}

interface IEquipmentImage {
  thumbnail: string;
  midsize: string;
  original: string;
}

interface IEquipment {
  serialNo: string;
  equipmentType: string;
  categories: string[];
  name: string;
  brand: string;
  color: string;
  modelNo: string;
  totalQuantity: number;
  conditionAndQuantity: IConditionAndQuantity[];
  unit: string;
  matter: Matter;
  description: string;
  status: EquipmentStatus;
  dateAcquired: Date;
  images: IEquipmentImage[];
  remarks: string;
  inventorytag: boolean;
  checkedBy: string;
  department: Department;
  inventorytype: EquipmentInventoryType;
  location: string;
  confirmed: boolean;
  warrantyPeriod: Date;
  availability: EquipmentAvailability;
  dis: boolean;
}

export const ConditionAndQuantitySchema = new Schema<IConditionAndQuantity>({
  condition: { type: String, required: true, enum: equipmentCondition },
  quantity: { type: Number, required: true },
});

const EquipmentImageSchema = new Schema<IEquipmentImage>({
  thumbnail: { type: String },
  midsize: { type: String },
  original: { type: String },
});

const EquipmentSchema = new Schema<IEquipment>(
  {
    serialNo: { type: String, required: true },
    equipmentType: { type: String, required: true },
    categories: { type: [String], required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    color: { type: String, required: true },
    modelNo: { type: String, required: true },
    totalQuantity: { type: Number, required: true },
    conditionAndQuantity: { type: [ConditionAndQuantitySchema], required: true },
    unit: { type: String, required: true },
    matter: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true, enum: equipmentStatus },
    dateAcquired: { type: Date, required: true, default: Date.now },
    images: { type: [EquipmentImageSchema], default: [] },
    remarks: { type: String, required: true },
    inventorytag: { type: Boolean, required: true },
    checkedBy: { type: String, required: true },
    department: { type: String, required: true, enum: departments },
    inventorytype: { type: String, required: true },
    location: { type: String, required: true },
    confirmed: { type: Boolean, required: true },
    warrantyPeriod: { type: Date, required: true, default: Date.now },
    availability: { type: String, required: true },
    dis: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('equipment', EquipmentSchema);