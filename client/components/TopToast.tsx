import { styled } from "nativewind";
import { Pressable, PressableProps, TextProps, View } from "react-native";
import { useEffect, useRef, useState } from "react"
import { Text, useTheme } from "react-native-paper";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useDispatch } from "react-redux";
import { resetTopToast } from "../redux/TopToast";
import { AppTheme } from "../theme";

export enum TopToastType {
    error,
    success,
    info,
    warn
}

export interface TopToastProps {
    visible: boolean,
    content: string,
    duration?: number,
    type: TopToastType | TopToastType.error
    // onTimeout: () => void
}


export function TopToast() {
    const theme = useTheme<AppTheme>()
    const animatedValue = useSharedValue(0)

    const props = useAppSelector(state => state.topToast.value)
    const dispatch = useAppDispatch()
    // const [ visible, setVisible ] = useState(false)

    useEffect(() => {
        if (props.visible) {
            handleShowAlert()
        }
    }, [props.visible])

    const handleShowAlert = () => {
        animatedValue.value = withTiming(1, { duration: 600 });
        if (props.duration !== undefined)
            setTimeout(() => {
                animatedValue.value = withTiming(0, { duration: 600 });
                setTimeout(() => {
                    dispatch(resetTopToast())
                }, 600);
            }, props.duration);
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animatedValue.value, [0, 1], [0, 1]),
            transform: [{ translateY: interpolate(animatedValue.value, [0, 1], [-50, 0]) }],
        };
    });

    let backgroundColor
    let color
    switch (props.type) {
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
            }}>{props.content}</Text>
        </Animated.View>

    );
}