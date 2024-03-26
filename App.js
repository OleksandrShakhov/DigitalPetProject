import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Vibration } from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
    const [sound, setSound] = useState();

    useEffect(() => {
        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('./assets/happy_sound.mp3')
                );
                setSound(sound);
            } catch (error) {
                console.log('Error loading sound', error);
            }
        };

        loadSound();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const treatPet = () => {
        if (sound) {
            sound.replayAsync();
        }
        // Placeholder logic for treating the pet
        console.log('Pet treated!');
        // Update pet state or perform any additional actions here
    };

    const petPet = () => {
        Vibration.vibrate();
        // Placeholder logic for petting the pet
        console.log('Pet petted!');
        // Update pet state or perform any additional actions here
    };

    return (
        <View style={styles.container}>
            <Text style={styles.happinessText}>Pet Happiness: 100</Text>
            <Pressable style={styles.treatButton} onPress={treatPet}>
                <Text style={styles.buttonText}>Treat</Text>
            </Pressable>
            <Pressable style={styles.petButton} onPress={petPet}>
                <Text style={styles.buttonText}>Pet</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    happinessText: {
        fontSize: 20,
        marginBottom: 20,
    },
    treatButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    petButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});
