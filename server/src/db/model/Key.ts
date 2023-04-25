import { model } from "mongoose";
import KeySchema, { IKey, KeyModel } from "../schema/KeySchema";

const Key = model<IKey, KeyModel>('Key', KeySchema)

export default Key