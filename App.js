import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Vibration, Animated, Modal, Button, PanResponder } from 'react-native';
import { Audio } from 'expo-av';
import { Gyroscope } from 'expo-sensors';

export default function App() {
    const [sound, setSound] = useState();
    const [happiness, setHappiness] = useState(100);
    const [hunger, setHunger] = useState(0);
    const [cleanliness, setCleanliness] = useState(100);

    const [mood, setMood] = useState('happy');
    const [animation] = useState(new Animated.Value(0));
    const [gameOver, setGameOver] = useState(false);
    const [gameOverReason, setGameOverReason] = useState('');

    useEffect(() => {
        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('./assets/feed_sound.mp3')
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

    useEffect(() => {
        const decreaseHappinessInterval = setInterval(() => {
            setHappiness((prevHappiness) => Math.max(0, prevHappiness - 10));
        }, 5000);

        const decreaseHungerInterval = setInterval(() => {
            setHunger((prevHunger) => Math.min(100, prevHunger + 20));
        }, 5000);

        const decreaseCleanlinessInterval = setInterval(() => {
            setCleanliness((prevCleanliness) => Math.max(0, prevCleanliness - 10));
        }, 5000);

        // Determine mood based on happiness, hunger, and cleanliness
        const determineMood = () => {
            if (happiness >= 50 && hunger <= 40 && cleanliness >= 50) {
                setMood('happy');
            } else if ((happiness >= 30 && happiness < 50) || (hunger > 40 && hunger <= 80) || (cleanliness > 30 && cleanliness <= 50)) {
                setMood('upset');
            } else {
                setMood('angry');
            }
        };

        determineMood(); // Initial mood determination

        // Check game over conditions
        if (happiness === 0) {
            setGameOver(true);
            setGameOverReason('Pet happiness reached 0');
        } else if (hunger === 100) {
            setGameOver(true);
            setGameOverReason('Pet hunger reached 100');
        } else if (cleanliness === 0) {
            setGameOver(true);
            setGameOverReason('Pet cleanliness reached 0');
        }

        return () => {
            clearInterval(decreaseHappinessInterval);
            clearInterval(decreaseHungerInterval);
            clearInterval(decreaseCleanlinessInterval);
        };
    }, [happiness, hunger, cleanliness]);

    const treatPet = () => {
        if (sound) {
            sound.replayAsync();
        }
        // Increase happiness when treating the pet
        setHappiness((prevHappiness) => Math.min(100, prevHappiness + 5));
    };

    const feedPet = () => {
        Vibration.vibrate();
        // Increase happiness when feeding the pet
        setHappiness((prevHappiness) => Math.min(100, prevHappiness + 10));
        // Decrease hunger when feeding the pet
        setHunger((prevHunger) => Math.max(0, prevHunger - 5));
    };

    const cleanPet = () => {
        // Increase cleanliness when cleaning the pet
        setCleanliness((prevCleanliness) => Math.min(100, prevCleanliness + 5));
    };

    const animatePet = () => {
        Animated.timing(animation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        animatePet();
    }, []);

    const restartGame = () => {
        setHappiness(100);
        setHunger(0);
        setCleanliness(100);
        setGameOver(false);
        setGameOverReason('');
    };

    // PanResponder for swipe gesture
    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderRelease: (evt, gestureState) => {
                // Check if the swipe occurred over the pet image
                if (gestureState.moveX > 0 && gestureState.moveY > 0) {
                    // Increase happiness when swiping over the pet image
                    setHappiness((prevHappiness) => Math.min(100, prevHappiness + 5));
                }
            },
        })
    ).current;

    return (
        <View style={styles.container}>
            <Text style={styles.happinessText}>Pet Happiness: {happiness}</Text>
            <Text style={styles.hungerText}>Hunger: {hunger}</Text>
            <Text style={styles.cleanlinessText}>Cleanliness: {cleanliness}</Text>
            <Text style={styles.moodText}>Mood: {mood}</Text>
            <Pressable style={styles.feedButton} onPress={feedPet}>
                <Text style={styles.buttonText}>Feed</Text>
            </Pressable>
            <Pressable style={styles.treatButton} onPress={treatPet}>
                <Text style={styles.buttonText}>Treat</Text>
            </Pressable>
            <Pressable style={styles.cleanButton} onPress={cleanPet}>
                <Text style={styles.buttonText}>Clean</Text>
            </Pressable>
            <Modal
                visible={gameOver}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setGameOver(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Game Over</Text>
                    <Text style={styles.modalText}>{gameOverReason}</Text>
                    <Button title="Start Again" onPress={restartGame} />
                </View>
            </Modal>
            <Animated.Image
                source={
                    mood === 'happy'
                        ? require('./assets/pet.png')
                        : mood === 'upset'
                            ? require('./assets/upset.png')
                            : require('./assets/angry.png')
                }
                style={[
                    styles.petImage,
                    {
                        transform: [
                            {
                                scale: animation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.1],
                                }),
                            },
                        ],
                    },
                ]}
                {...panResponder.panHandlers} // Add panHandlers to the pet image
            />
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
        marginBottom: 10,
    },
    hungerText: {
        fontSize: 20,
        marginBottom: 10,
    },
    cleanlinessText: {
        fontSize: 20,
        marginBottom: 10,
    },
    moodText: {
        fontSize: 20,
        marginBottom: 20,
    },
    feedButton: {
        backgroundColor: 'orange',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    treatButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    cleanButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    petImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        color: '#fff',
    },
});

