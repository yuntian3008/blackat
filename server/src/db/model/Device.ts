import { model } from "mongoose";
import DeviceSchema, { DeviceModel, IDevice } from "../schema/DeviceSchema";

const Device = model<IDevice, DeviceModel>('Device', DeviceSchema)

export default Device