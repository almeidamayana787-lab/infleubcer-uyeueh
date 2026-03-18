import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions } from 'react-native';

interface NotificationPopupProps {
    visible: boolean;
    title: string;
    message: string;
    onHide: () => void;
}

const { width } = Dimensions.get('window');

export default function NotificationPopup({ visible, title, message, onHide }: NotificationPopupProps) {
    const translateY = React.useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.spring(translateY, {
                    toValue: 20,
                    useNativeDriver: true,
                    bounciness: 10,
                }),
                Animated.delay(5000),
                Animated.timing(translateY, {
                    toValue: -120,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onHide();
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5968/5968314.png' }} // Nubank-like Icon
                        style={styles.icon}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    <Text style={styles.message} numberOfLines={2}>{message}</Text>
                </View>
            </View>
            <View style={styles.indicator} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 40, // Adjust for notch/dynamic island
        left: 12,
        right: 12,
        zIndex: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#820ad1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        tintColor: 'white',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        color: '#333',
        lineHeight: 18,
    },
    indicator: {
        width: 36,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
    }
});
