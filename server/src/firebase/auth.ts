import { DecodedIdToken, getAuth } from "firebase-admin/auth"
import { app } from ".";

export const auth = getAuth(app)

export function verifyIdToken(idToken: string) : Promise<DecodedIdToken> {
    return auth.verifyIdToken(idToken)
}