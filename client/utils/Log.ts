export const LogEnabled = true

export default function Log(message?: any, ...optionalParams: any[]) {
    if (LogEnabled)
        console.log(message, ...optionalParams)
}