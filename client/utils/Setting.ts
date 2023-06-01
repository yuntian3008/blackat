import RNFS, { mkdir, moveFile, readFile, writeFile } from "react-native-fs"
import SignalModule from "../native/android/SignalModule"
import { App } from "../../shared/types"

export const PROFILE_DIRECTORY = `${RNFS.DocumentDirectoryPath}/profile`

export const updateAvatar = async (source: string, mime: string): Promise<void> => {
    let ext
    switch (mime) {
        case "image/jpeg":
            ext = '.jpg'
            break;
        case "image/png":
            ext = '.png'
            break;
        default:
            throw new Error("not-support")
    }
    
    await mkdir(PROFILE_DIRECTORY)
    const time = (new Date()).getMilliseconds()
    const avatarPath = `file://${PROFILE_DIRECTORY}/avatar-${time}${ext}`
    await moveFile(source,avatarPath)
    await SignalModule.updateProfile({
        avatar: avatarPath
    })
}

export const updateName = async (newName: string): Promise<void> => {
    if (newName.trim().length > 0) {
        await SignalModule.updateProfile({
            name: newName.trim()
        })
    }
    else
        throw new Error('empty')
}

export const getProfileData = async (): Promise<string> => {
    const profile = await SignalModule.getProfile()
    const profileData = {
        avatar: typeof profile.avatar === "string" ? await readFile(profile.avatar,"base64") : null,
        name: profile.name ?? null,
    }
    return JSON.stringify(profileData)
}

export const savePartnerProfile = async (e164: string, profileData: string): Promise<App.Types.Profile> => {
    const profile = JSON.parse(profileData)
    let result: App.Types.Profile = {
        e164: e164,
        avatar: null,
        name: (typeof profile.name == "string") ? profile.name : null
    }
    if (typeof profile.avatar === "string") {
        const time = (new Date()).getMilliseconds()
        const folder = e164.replace("+","")
        await mkdir(`${PROFILE_DIRECTORY}/${folder}`)
        const avatarPath = `file://${PROFILE_DIRECTORY}/${folder}/avatar-${time}.jpg`
        await writeFile(avatarPath,profile.avatar, "base64")
        result.avatar = avatarPath
    }
    return result
}