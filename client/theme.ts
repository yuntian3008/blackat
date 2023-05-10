import {
    MD3LightTheme as LightTheme,
    MD3DarkTheme as DarkTheme,
    MD3Theme,
} from 'react-native-paper';


export const lightTheme: AppTheme = {
    ...LightTheme,
    version: 3,
    mode: 'adaptive',
    roundness: 20,
    "colors": {
        ...LightTheme.colors,
        "primary": "rgb(0, 101, 141)",
        "onPrimary": "rgb(255, 255, 255)",
        "primaryContainer": "rgb(198, 231, 255)",
        "onPrimaryContainer": "rgb(0, 30, 45)",
        "secondary": "rgb(0, 103, 125)",
        "onSecondary": "rgb(255, 255, 255)",
        "secondaryContainer": "rgb(179, 235, 255)",
        "onSecondaryContainer": "rgb(0, 31, 39)",
        "tertiary": "rgb(0, 100, 150)",
        "onTertiary": "rgb(255, 255, 255)",
        "tertiaryContainer": "rgb(204, 229, 255)",
        "onTertiaryContainer": "rgb(0, 30, 49)",
        "error": "rgb(186, 26, 26)",
        "onError": "rgb(255, 255, 255)",
        "errorContainer": "rgb(255, 218, 214)",
        "onErrorContainer": "rgb(65, 0, 2)",
        "background": "rgb(252, 252, 255)",
        "onBackground": "rgb(25, 28, 30)",
        "surface": "rgb(252, 252, 255)",
        "onSurface": "rgb(25, 28, 30)",
        "surfaceVariant": "rgb(221, 227, 234)",
        "onSurfaceVariant": "rgb(65, 72, 77)",
        "outline": "rgb(113, 120, 126)",
        "outlineVariant": "rgb(193, 199, 206)",
        "shadow": "rgb(0, 0, 0)",
        "scrim": "rgb(0, 0, 0)",
        "inverseSurface": "rgb(46, 49, 51)",
        "inverseOnSurface": "rgb(240, 241, 243)",
        "inversePrimary": "rgb(130, 207, 255)",
        "elevation": {
            "level0": "transparent",
            "level1": "rgb(239, 244, 249)",
            "level2": "rgb(232, 240, 246)",
            "level3": "rgb(224, 235, 243)",
            "level4": "rgb(222, 234, 241)",
            "level5": "rgb(217, 231, 239)"
        },
        "surfaceDisabled": "rgba(25, 28, 30, 0.12)",
        "onSurfaceDisabled": "rgba(25, 28, 30, 0.38)",
        "backdrop": "rgba(43, 49, 54, 0.4)",
        "success": "rgb(56, 107, 1)",
        "onSuccess": "rgb(255, 255, 255)",
        "successContainer": "rgb(183, 244, 129)",
        "onSuccessContainer": "rgb(13, 32, 0)",
        "warning": "rgb(150, 73, 0)",
        "onWarning": "rgb(255, 255, 255)",
        "warningContainer": "rgb(255, 220, 198)",
        "onWarningContainer": "rgb(49, 19, 0)",
        "info": "rgb(0, 99, 154)",
        "onInfo": "rgb(255, 255, 255)",
        "infoContainer": "rgb(206, 229, 255)",
        "onInfoContainer": "rgb(0, 29, 50)"
    }

};

export const lightThemeWithoutRoundness: AppTheme = {
    ...lightTheme,
    roundness: 0
}

export const darkTheme: AppTheme = {
    ...DarkTheme,
    version: 3,
    mode: 'adaptive',
    roundness: 20,

    "colors": {
        "primary": "rgb(130, 207, 255)",
        "onPrimary": "rgb(0, 52, 75)",
        "primaryContainer": "rgb(0, 76, 107)",
        "onPrimaryContainer": "rgb(198, 231, 255)",
        "secondary": "rgb(90, 213, 249)",
        "onSecondary": "rgb(0, 54, 66)",
        "secondaryContainer": "rgb(0, 78, 95)",
        "onSecondaryContainer": "rgb(179, 235, 255)",
        "tertiary": "rgb(145, 204, 255)",
        "onTertiary": "rgb(0, 51, 81)",
        "tertiaryContainer": "rgb(0, 75, 115)",
        "onTertiaryContainer": "rgb(204, 229, 255)",
        "error": "rgb(255, 180, 171)",
        "onError": "rgb(105, 0, 5)",
        "errorContainer": "rgb(147, 0, 10)",
        "onErrorContainer": "rgb(255, 180, 171)",
        "background": "rgb(25, 28, 30)",
        "onBackground": "rgb(226, 226, 229)",
        "surface": "rgb(25, 28, 30)",
        "onSurface": "rgb(226, 226, 229)",
        "surfaceVariant": "rgb(65, 72, 77)",
        "onSurfaceVariant": "rgb(193, 199, 206)",
        "outline": "rgb(139, 145, 152)",
        "outlineVariant": "rgb(65, 72, 77)",
        "shadow": "rgb(0, 0, 0)",
        "scrim": "rgb(0, 0, 0)",
        "inverseSurface": "rgb(226, 226, 229)",
        "inverseOnSurface": "rgb(46, 49, 51)",
        "inversePrimary": "rgb(0, 101, 141)",
        "elevation": {
            "level0": "transparent",
            "level1": "rgb(30, 37, 41)",
            "level2": "rgb(33, 42, 48)",
            "level3": "rgb(37, 48, 55)",
            "level4": "rgb(38, 50, 57)",
            "level5": "rgb(40, 53, 62)"
        },
        "surfaceDisabled": "rgba(226, 226, 229, 0.12)",
        "onSurfaceDisabled": "rgba(226, 226, 229, 0.38)",
        "backdrop": "rgba(43, 49, 54, 0.4)",
        "success": "rgb(156, 215, 105)",
        "onSuccess": "rgb(26, 55, 0)",
        "successContainer": "rgb(40, 80, 0)",
        "onSuccessContainer": "rgb(183, 244, 129)",
        "warning": "rgb(255, 183, 134)",
        "onWarning": "rgb(80, 36, 0)",
        "warningContainer": "rgb(114, 54, 0)",
        "onWarningContainer": "rgb(255, 220, 198)",
        "info": "rgb(150, 204, 255)",
        "onInfo": "rgb(0, 51, 83)",
        "infoContainer": "rgb(0, 74, 117)",
        "onInfoContainer": "rgb(206, 229, 255)"
    }

};

export const darkThemeWithoutRoundness: AppTheme = {
    ...darkTheme,
    roundness: 0
}
const themeTyped = {
    ...LightTheme,
    // Specify a custom property in nested object
    colors: {
      ...LightTheme.colors,
      "success": "rgb(156, 215, 105)",
      "onSuccess": "rgb(26, 55, 0)",
      "successContainer": "rgb(40, 80, 0)",
      "onSuccessContainer": "rgb(183, 244, 129)",
      "warning": "rgb(255, 183, 134)",
      "onWarning": "rgb(80, 36, 0)",
      "warningContainer": "rgb(114, 54, 0)",
      "onWarningContainer": "rgb(255, 220, 198)",
      "info": "rgb(150, 204, 255)",
      "onInfo": "rgb(0, 51, 83)",
      "infoContainer": "rgb(0, 74, 117)",
      "onInfoContainer": "rgb(206, 229, 255)"
    },
  };
export type AppTheme = typeof themeTyped