import { Model, model } from "mongoose";
import UserSchema, { IUser, LoginResult, UserModel } from "../schema/UserSchema";

const User = model<IUser,UserModel>('User', UserSchema)

export default User