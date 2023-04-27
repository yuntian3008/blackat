import { useState } from "react"
import { View } from "react-native"
import { Divider, IconButton, Menu } from "react-native-paper"

export type MenuItems = {
    icon?: string,
    label: string,
    onPress?: () => void
} | undefined

export type HeaderItems = {
    label: string,
    onPress?: () => void,
    items?: MenuItems[]
}

export type HeaderProps = {
    items: HeaderItems[]
}

const Header = ({ items }: HeaderProps) => {

    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    return (
        <View style={{ flexDirection: "row", position: 'relative', gap: 0 }}>
            {
                items.map((headerItems, index) => (
                    headerItems.items === undefined ?
                        <IconButton key={index} icon={headerItems.label} onPress={headerItems.onPress} /> :
                        <Menu
                            key={index}
                            visible={menuVisible}
                            onDismiss={closeMenu}
                            anchor={
                                <IconButton
                                    icon={headerItems.label}
                                    onPress={openMenu} />
                            }
                            anchorPosition="bottom"
                            >
                            {
                                headerItems.items.map((menuItems, menuIndex) => {
                                    return menuItems !== undefined ? <Menu.Item key={menuIndex} onPress={() => {
                                        menuItems.onPress && menuItems.onPress()
                                        closeMenu()
                                    }} title={menuItems.label} leadingIcon={menuItems.icon} /> : <Divider key={menuIndex} />
                                })
                            }
                        </Menu>
                ))
            }
        </View>
    )
}

export default Header