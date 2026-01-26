import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MOCK_ROOMS } from '@csmac/types';

interface TaskListScreenProps {
    workerName: string;
    onSelectRoom: (roomId: string) => void;
    onLogout: () => void;
}

export default function TaskListScreen({ workerName, onSelectRoom, onLogout }: TaskListScreenProps) {
    const myTasks = MOCK_ROOMS; // For prototype, showing all rooms

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Hello, {workerName}</Text>
                <Text style={styles.logout} onPress={onLogout}>Logout</Text>
            </View>

            <Text style={styles.sectionTitle}>Assigned Rooms</Text>

            <FlatList
                data={myTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card, item.status === 'CLEAN' ? styles.cardClean : styles.cardDirty]}
                        onPress={() => onSelectRoom(item.id)}
                    >
                        <View>
                            <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
                            <Text style={styles.status}>{item.status}</Text>
                        </View>
                        <Text style={styles.arrow}>&gt;</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    welcome: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    logout: {
        color: 'red',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    card: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardClean: {
        borderLeftWidth: 5,
        borderLeftColor: 'green',
    },
    cardDirty: {
        borderLeftWidth: 5,
        borderLeftColor: 'orange',
    },
    roomNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    status: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    arrow: {
        fontSize: 18,
        color: '#ccc',
    }
});
