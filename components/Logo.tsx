
import { useEffect, useRef, useState } from "react"
import { Animated, Easing } from "react-native"
import Svg, { SvgProps, Path, NumberProp } from "react-native-svg"

type Props = {
    isLoop?: boolean
    width?: NumberProp,
    height?: NumberProp,
    onFinish?: Animated.EndCallback,
}


const Logo = ({ width, height, isLoop, onFinish }: Props) => {
    const [offset, setOffSet] = useState("")
    const animate = useRef(new Animated.Value(0)).current



    const effect = Animated.timing(animate, {
        toValue: 1035,
        duration: 2000,
        easing: Easing.bezier(0.22, 0.61, 0.36, 1),
        useNativeDriver: false
    })




    useEffect(() => {
        if (isLoop)
           Animated.loop(effect).start()
        else
            effect.start(onFinish)

        animate.addListener((p) => {
            setOffSet((1035 - p.value).toFixed(0))
        })

    }, [animate])



    return (
        <Animated.View>
            <Svg
                width={width || 150}
                height={height || 150}
                viewBox="0 0 595.28 595.28"
            >
                <Path
                    fill="none"
                    stroke="#000"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={20}
                    strokeDasharray={1035}
                    strokeDashoffset={offset}
                    d="M302.87 264.87s31.96-35.69 94.83-9.26c0 0 34.05 13.14 35.84 54.66 0 0 6.57 37.63-43.16 65.41 0 0-61.53 37.11-155.16 8.66 0 0-4.52-1.62-11.27-4.93h0l-62.5 45.55 32.39-66.13-.03-.03c-5-3.93-13.73-11.87-20.06-24.79-6.96-14.2-7.45-27.16-7.26-33.62 0 0-4.93-45.4 53.76-74.97 0 0 36.14-20.16 76.46-18.22l10.6-36.89 23.89 21.65s44.5-6.72 68.99 13.44l30.61-11.8-6.57 39.72"
                // s={{
                //     fill: "none",
                //     stroke: "#000",
                //     strokeLinecap: "round",
                //     strokeLinejoin: "round",
                //     strokeWidth: 20,
                //     strokeDasharray: 1035,
                //     strokeDashoffset: 1035,
                //     animation: "dash 2s ease infinite",
                // }}
                />
            </Svg>
        </Animated.View>

    )
}

export default Logo