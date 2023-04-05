import { Model, Schema, Types } from "mongoose";

export interface ICounter {
    id: Types.ObjectId,
    name: string
    seq: number
}

export interface CounterModel extends Model<ICounter> {
    inc(id: Types.ObjectId, name: string): Promise<number>;
    des(id: Types.ObjectId, name: string): Promise<number>;
}

const CounterSchema = new Schema<ICounter, CounterModel>({
    id: { type: Schema.Types.ObjectId, required: true},
    name: { type: String, required: true},
    seq: { type: Number, default: 0 }
});

CounterSchema.static('inc', async function inc(id: Types.ObjectId, name: string) {
    let model = this
    return new Promise<number>((resolve,reject) => {
        model.findOneAndUpdate({ id: id, name: name }, { $inc: {seq: 1} }, {
            upsert: true,
            new: true
        }).then(doc => resolve(doc.seq)).catch(err => reject(err))
    }) 
})

CounterSchema.static('des', async function des(id: Types.ObjectId, name: string) {
    let model = this
    return new Promise<number>((resolve,reject) => {
        model.findOneAndUpdate({ id: id, name: name }, { $inc: {seq: -1} }, {
            upsert: true,
            new: true
        }).then(doc => resolve(doc.seq)).catch(err => reject(err))
    }) 
})

export default CounterSchema