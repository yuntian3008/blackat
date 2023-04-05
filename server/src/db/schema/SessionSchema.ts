import { Schema, Types } from "mongoose";

interface ISession {
    status: boolean,
    lastActiveAt: Date,
    userId: Types.ObjectId
}

const UserSchema = new Schema<ISession> ({
    
})

export default UserSchema