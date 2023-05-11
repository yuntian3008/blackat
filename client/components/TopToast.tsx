import { styled } from "nativewind";
import { Pressable, PressableProps, TextProps, View } from "react-native";
import { useEffect, useRef, useState } from "react"
import { Text, useTheme } from "react-native-paper";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useDispatch } from "react-redux";
import { dequeueTopToast } from "../redux/TopToast";
import { AppTheme } from "../theme";

export enum TopToastType {
    error,
    success,
    info,
    warn
}

export interface TopToastProps {
    content: string,
    duration: number,
    type: TopToastType
    // onTimeout: () => void
}


export function TopToast() {
    const theme = useTheme<AppTheme>()
    const animatedValue = useSharedValue(0)

    const queue = useAppSelector(state => state.topToast)
    const dispatch = useAppDispatch()
    // const [ type, setType ] = useState<TopToastType>(TopToastType.info)
    // const [ content, setContent ] = useState<string>("")
    const [ currentToast, setCurrentToast] = useState<TopToastProps>({
        content: "",
        duration: 3000,
        type: TopToastType.info
    })

    useEffect(() => {
        if (queue.length > 0 && queue[0] !== currentToast) {
            setCurrentToast(queue[0])
            // setType(currentToast.type)
            // setContent(currentToast.content)
            handleShowAlert(queue[0].duration).then(() => {
                dispatch(dequeueTopToast())
            })
        }
        // if (props.visible) {
        //     handleShowAlert()
        // }
        // else {
        //     animatedValue.value = withTiming(0, { duration: 600 });
        // }
    }, [queue])

    const handleShowAlert = (duration: number): Promise<void> => {
        return new Promise((resolve, reject) => {
            animatedValue.value = withTiming(1, { duration: 600 });
            setTimeout(() => {
                animatedValue.value = withTiming(0, { duration: 600 });
                setTimeout(() => {
                    resolve()
                }, 600);
            }, duration + 600);
        });
        // if (animatedValue.value == 1) {
        //     animatedValue.value = withTiming(0, { duration: 600 });
        // }
        // else {
        //     animatedValue.value = withTiming(1, { duration: 600 });
        //     if (props.duration !== undefined)
        //         setTimeout(() => {
        //             dispatch(resetTopToast())
        //         }, props.duration);
        // }

    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animatedValue.value, [0, 1], [0, 1]),
            transform: [{ translateY: interpolate(animatedValue.value, [0, 1], [-50, 0]) }],
        };
    });

    let backgroundColor
    let color
    switch (currentToast.type) {
        case TopToastType.info:
            backgroundColor = theme.colors.infoContainer
            color = theme.colors.info
            break;
        case TopToastType.error:
            backgroundColor = theme.colors.errorContainer
            color = theme.colors.error
            break;
        case TopToastType.success:
            backgroundColor = theme.colors.successContainer
            color = theme.colors.success
            break;
        case TopToastType.warn:
            backgroundColor = theme.colors.warningContainer
            color = theme.colors.warning
            break;

        default:
            backgroundColor = undefined
            color = undefined
            break;
    }

    return (
        <Animated.View style={[
            {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                padding: 5,
                backgroundColor: backgroundColor,
            },
            animatedStyle
        ]}>
            <Text variant="labelMedium" style={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: color
            }}>{currentToast.content}</Text>
        </Animated.View>

    );
}