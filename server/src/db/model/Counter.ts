import { model } from "mongoose";
import CounterSchema, { CounterModel, ICounter } from "../schema/CounterSchema";

const Counter = model<ICounter, CounterModel>('Counter', CounterSchema);

export default Counter