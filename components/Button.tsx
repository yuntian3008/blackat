import { styled } from "nativewind";
import { Pressable, PressableProps, Text, TextProps, View } from "react-native";

type PropsWithoutConflicts = Omit<PressableProps, "children" | "style"> &
    Omit<TextProps, "onLongPress" | "onPress" | "onPressIn" | "onPressOut">;

interface ButtonProps extends PropsWithoutConflicts {
    buttonStyle?: string,
    textStyle?: string,
    viewStyle?: string,
}

const TwText = styled(Text);

export function Button({
    viewStyle,
    textStyle,
    buttonStyle,
    children,
    android_disableSound,
    android_ripple,
    unstable_pressDelay,
    delayLongPress,
    disabled,
    hitSlop,
    onLongPress,
    onPress,
    onPressIn,
    onPressOut,
    pressRetentionOffset,
    testOnly_pressed,
    ...props
}: ButtonProps) {
    return (
    <View className={viewStyle}>
        <Pressable
            className={buttonStyle}
            android_disableSound={android_disableSound}
            android_ripple={android_ripple}
            unstable_pressDelay={unstable_pressDelay}
            delayLongPress={delayLongPress}
            disabled={disabled}
            hitSlop={hitSlop}
            onLongPress={onLongPress}
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            pressRetentionOffset={pressRetentionOffset}
            testOnly_pressed={testOnly_pressed}
        >
            <TwText className={textStyle} {...props}>
                {children}
            </TwText>
        </Pressable>
    </View>
        
    );
}