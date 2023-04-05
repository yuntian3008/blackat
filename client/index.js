/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProp } from 'react-native-paper/lib/typescript/src/types'
import App from './App';
import { name as appName } from './app.json';
import { darkTheme, lightTheme } from './theme';



export default function Main() {
    const colorScheme = useColorScheme()
    return (
        <PaperProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
            <App />
        </PaperProvider>
    );
}

AppRegistry.registerComponent(appName, () => Main);
