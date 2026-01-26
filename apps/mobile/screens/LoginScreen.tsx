import { View, Text, Button, StyleSheet } from 'react-native';
import { MOCK_WORKERS } from '@csmac/types';

interface LoginScreenProps {
    onLogin: (workerId: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>CSMAC Field App</Text>
            <Text style={styles.subtitle}>Select User to Login (Mock)</Text>

            <View style={styles.buttonContainer}>
                {MOCK_WORKERS.filter(w => w.role === 'FIELD_WORKER').map((worker) => (
                    <View key={worker.id} style={styles.buttonWrapper}>
                        <Button title={`Login as ${worker.name}`} onPress={() => onLogin(worker.id)} />
                    </View>
                ))}
                {MOCK_WORKERS.filter(w => w.role === 'MANAGER').map((worker) => (
                    <View key={worker.id} style={styles.buttonWrapper}>
                        <Button title={`Login as Manager ${worker.name}`} color="gray" onPress={() => onLogin(worker.id)} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        gap: 10,
    },
    buttonWrapper: {
        marginBottom: 10,
    }
});
