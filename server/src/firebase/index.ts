import { ServiceAccount, cert, initializeApp } from "firebase-admin/app";
import serviceAccountKey from "../../service-account-key"

const serviceAccount: ServiceAccount = {
    clientEmail: serviceAccountKey.client_email,
    privateKey: serviceAccountKey.private_key,
    projectId: serviceAccountKey.project_id
}

export const app = initializeApp({
    credential: cert(serviceAccount)
})

