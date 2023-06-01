import { styled } from "nativewind";
import { Alert, FlatList, FlatListProps, Image, Pressable, PressableProps, SectionList, SectionListProps, SectionListRenderItem, TextProps, TouchableNativeFeedback, TouchableWithoutFeedback, View } from "react-native";
import { useEffect, useRef, useState } from "react"
import { Text, useTheme } from "react-native-paper";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useDispatch } from "react-redux";
import { dequeueTopToast } from "../redux/TopToast";
import { AppTheme } from "../theme";
import { ScrollView } from "react-native-gesture-handler";

export interface StickerPickerListener {
    onStickerWillShow: () => void,
    onStickerWillHide: () => void,
    onStickerDidShow: () => void,
    onStickerDidHide: () => void,
}

export interface StickerPickerProps {
    visible: boolean,
    listener: StickerPickerListener,
    onStickerPress: (sticker: string) => void,
}

interface StickerPackage {
    id: number
    title: string,
    data: string[],
}

const stickers: Array<StickerPackage> = [
    {
        id: 1,
        title: 'Bugcat Capoo and Tutu - Love sniper',
        data: [...Array(24).keys()].map((v) => {
            return `asset:/bugcat_capoo_and_tutu_love_sniper/${v + 1}.gif`
        }),
    },
    {
        id: 2,
        title: 'Bugcat Capoo',
        data: [...Array(50).keys()].map((v) => {
            return `asset:/bugcat_capoo/${v + 1}.gif`
        }),
    },
    {
        id: 3,
        title: 'Bugcat Capoo - Crazy workplace',
        data: [...Array(24).keys()].map((v) => {
            return `asset:/bugcat_capoo_crazy_workplace/${v + 1}.gif`
        }),
    },
    {
        id: 4,
        title: 'Love Hamsters',
        data: [...Array(15).keys()].map((v) => {
            return `asset:/love_hamsters/${v + 1}.gif`
        }),
    },
    {
        id: 5,
        title: 'Mimi and Neko together',
        data: [...Array(24).keys()].map((v) => {
            return `asset:/mimi_and_neko_together/${v + 1}.gif`
        }),
    },
    {
        id: 6,
        title: 'Mochi Mochi Peach',
        data: [...Array(74).keys()].map((v) => {
            return `asset:/mochi_mochi_peach/${v + 1}.gif`
        }),
    },
    {
        id: 7,
        title: 'Mochi Mochi Peach and Goma',
        data: [...Array(56).keys()].map((v) => {
            return `asset:/mochi_mochi_peach_and_goma/${v + 1}.gif`
        }),
    },
]

export function StickerPicker({
    visible,
    listener,
    onStickerPress
}: StickerPickerProps): JSX.Element {
    const theme = useTheme<AppTheme>()
    const animatedValue = useSharedValue(0)
    const [initializing, setInitializing] = useState(0)
    const [currentSticker, setCurrentSticker] = useState<StickerPackage>(stickers[0])

    useEffect(() => {
        const showDuration = 200
        const hideDuration = 200
        if (visible) {
            setInitializing(1)
            listener.onStickerWillShow()
            animatedValue.value = withTiming(1, { duration: showDuration })
            setTimeout(listener.onStickerDidShow, showDuration)
        }
        else {
            if (initializing > 0) {
                listener.onStickerWillHide()
                animatedValue.value = withTiming(0, { duration: hideDuration })
                setTimeout(listener.onStickerDidHide, hideDuration)
            }

        }
    }, [visible])


    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animatedValue.value, [0, 1], [0, 1]),
            height: interpolate(animatedValue.value, [0, 1], [0, 350])
            // transform: [{ translateY: interpolate(animatedValue.value, [0, 1], [-50, 0]) }],
        };
    });


    return (
        <Animated.View style={[
            {
                width: '100%',
                flexDirection: 'column'
            },
            animatedStyle
        ]}>
            <FlatList
                horizontal
                data={stickers.map((v) => {
                    return v
                })}
                legacyImplementation
                removeClippedSubviews
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 8,
                    paddingBottom: 8,
                    gap: 16,
                    // flexWrap: 'wrap',

                }}
                keyExtractor={(item) => item.id + ""}
                renderItem={({ item }) => (
                    <View
                        style={{
                            overflow: 'hidden',
                            borderRadius: 20,
                            // borderWidth: 0.5,
                            borderColor: theme.colors.primary
                        }}
                    >
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple(theme.colors.primaryContainer, true)}
                            onPress={() => { setCurrentSticker(item) }}
                        >
                            <View>
                                <Image source={
                                    {
                                        uri: item.data[0]
                                    }
                                } style={{
                                    width: 70,
                                    height: 70,

                                }}
                                />
                            </View>
                        </TouchableNativeFeedback>
                    </View>


                )}
            />
            <FlatList
                extraData={currentSticker.data}
                data={currentSticker.data}
                legacyImplementation
                removeClippedSubviews
                contentContainerStyle={{

                    // flexWrap: 'wrap',

                }}
                keyExtractor={(item, index) => item + index}
                numColumns={2}
                columnWrapperStyle={{
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    flexWrap: 'wrap',
                    width: '100%'
                }}
                renderItem={({ item }) => (
                    <View style={{
                        overflow: 'hidden',
                        borderRadius: 20,
                    }}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple(theme.colors.primaryContainer, true)}
                            onPress={() => { onStickerPress(item) }}
                        >
                            <View>
                                <Image source={
                                    {
                                        uri: item
                                    }
                                } style={{
                                    width: 150,
                                    height: 150,
                                }}
                                />
                            </View>
                        </TouchableNativeFeedback>

                    </View>

                )}
            />

        </Animated.View>

    );
}