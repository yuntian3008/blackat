import { model } from "mongoose";
import MailSchema, { IMail, MailModel } from "../schema/MailboxSchema";

const Mail = model<IMail, MailModel>('Mailbox', MailSchema)

export default Mail