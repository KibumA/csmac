import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { useState } from 'react';
import { MOCK_WORKERS, Worker } from '@csmac/types';
import LoginScreen from './screens/LoginScreen';
import ValidatedTaskListScreen from './screens/TaskListScreen';
// import InspectionScreen from './screens/InspectionScreen'; // Will implement next

export default function App() {
    const [currentUser, setCurrentUser] = useState<Worker | null>(null);
    const [currentScreen, setCurrentScreen] = useState<'LOGIN' | 'TASK_LIST' | 'INSPECTION'>('LOGIN');
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    const handleLogin = (workerId: string) => {
        const worker = MOCK_WORKERS.find((w) => w.id === workerId);
        if (worker) {
            setCurrentUser(worker);
            setCurrentScreen('TASK_LIST');
        }
    };

    const handleSelectRoom = (roomId: string) => {
        setSelectedRoomId(roomId);
        setCurrentScreen('INSPECTION');
    };

    const handleBack = () => {
        if (currentScreen === 'INSPECTION') {
            setCurrentScreen('TASK_LIST');
            setSelectedRoomId(null);
        } else if (currentScreen === 'TASK_LIST') {
            setCurrentScreen('LOGIN');
            setCurrentUser(null);
        }
    };

    return (
        <View style={styles.container}>
            {currentScreen === 'LOGIN' && <LoginScreen onLogin={handleLogin} />}
            {currentScreen === 'TASK_LIST' && currentUser && (
                <ValidatedTaskListScreen
                    workerName={currentUser.name}
                    onSelectRoom={handleSelectRoom}
                    onLogout={handleBack}
                />
            )}
            {currentScreen === 'INSPECTION' && (
                <View style={styles.center}>
                    <Text>Inspection Screen for Room {selectedRoomId} (Coming Soon)</Text>
                    <Text onPress={handleBack} style={{ color: 'blue', marginTop: 20 }}>Go Back</Text>
                </View>
            )}
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
