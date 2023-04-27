import {
    MD3LightTheme as LightTheme,
    MD3DarkTheme as DarkTheme,
    MD3Theme,
} from 'react-native-paper';


export const lightTheme: MD3Theme = {
    ...LightTheme,
    version: 3,
    mode: 'adaptive',
    roundness: 20,

    "colors": {
        ...LightTheme.colors,
        "primary": "#00658d",
        "onPrimary": "#ffffff",
        "primaryContainer": "#c6e7ff",
        "onPrimaryContainer": "#001e2d",

        "secondary": "#00677d",
        "onSecondary": "#ffffff",
        "secondaryContainer": "#b3ebff",
        "onSecondaryContainer": "#001f27",

        "tertiary": "#006497",
        "onTertiary": "#ffffff",
        "tertiaryContainer": "#cce5ff",
        "onTertiaryContainer": "#001e31",

        "error": "#ba1a1a",
        "onError": "#ffffff",
        "errorContainer": "#ffdad6",
        "onErrorContainer": "#410002",

        "background": "#fcfcff",
        "onBackground": "#191c1e",

        "surface": "#fcfcff",
        "onSurface": "#191c1e",

        "surfaceVariant": "#dde3ea",
        "onSurfaceVariant": "#41484d",

        "outline": "#71787e",

        // "inverseSurface": "rgb(52, 47, 50)",
        // "inverseOnSurface": "rgb(248, 238, 242)",
        // "inversePrimary": "#fcfcff",
        "elevation": {
            "level0": "transparent",
            "level1": "rgb(239,244,249)",
            "level2": "rgb(232,240,246)",
            "level3": "rgb(224,235,242)",
            "level4": "rgb(222,234,241)",
            "level5": "rgb(217,231,239)"
        },
        // "surfaceDisabled": "rgba(30, 26, 29, 0.12)",
        // "onSurfaceDisabled": "rgba(30, 26, 29, 0.38)",
        // "backdrop": "rgba(55, 46, 52, 0.4)"
    }
};

export const lightThemeWithoutRoundness: MD3Theme = {
    ...lightTheme,
    roundness: 0
}

export const darkTheme: MD3Theme = {
    ...DarkTheme,
    version: 3,
    mode: 'adaptive',
    roundness: 20,

    colors: {
        ...DarkTheme.colors,
        "primary": "#82cfff",
        "onPrimary": "#00344b",
        "primaryContainer": "#004c6b",
        "onPrimaryContainer": "#c6e7ff",

        "secondary": "#59d5f8",
        "onSecondary": "#003642",
        "secondaryContainer": "#004e5f",
        "onSecondaryContainer": "#b3ebff",

        "tertiary": "#92ccff",
        "onTertiary": "#003351",
        "tertiaryContainer": "#004b73",
        "onTertiaryContainer": "#cce5ff",

        "error": "#ffb4ab",
        "onError": "#690005",
        "errorContainer": "#93000a",
        "onErrorContainer": "#ffdad6",

        "background": "#191c1e",
        "onBackground": "#e2e2e5",

        "surface": "#191c1e",
        "onSurface": "#e2e2e5",

        "surfaceVariant": "#41484d",
        "onSurfaceVariant": "#c1c7ce",

        "outline": "#8b9198",

        "elevation": {
            "level0": "transparent",
            "level1": "rgb(30,37,41)",
            "level2": "rgb(33,42,48)",
            "level3": "rgb(37,48,55)",
            "level4": "rgb(38,49,57)",
            "level5": "rgb(40,53,62)"
        },
    }
};

export const darkThemeWithoutRoundness: MD3Theme = {
    ...darkTheme,
    roundness: 0
}