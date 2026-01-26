import Link from "next/link";
import { MOCK_ROOMS } from "@csmac/types";

export default function RoomsPage() {
    return (
        <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
            <header style={{ marginBottom: 40 }}>
                <Link href="/" style={{ marginBottom: 20, display: 'block', color: 'blue' }}>&larr; Back to Dashboard</Link>
                <h1>Room Status Grid</h1>
            </header>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: '#eee' }}>
                        <th style={thStyle}>Room #</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Floor</th>
                        <th style={thStyle}>Assigned Worker</th>
                        <th style={thStyle}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {MOCK_ROOMS.map(room => (
                        <tr key={room.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={tdStyle}>{room.roomNumber}</td>
                            <td style={tdStyle}>
                                <span style={{
                                    padding: '4px 8px', borderRadius: 4, fontSize: 12,
                                    backgroundColor: getStatusColor(room.status), color: 'white'
                                }}>
                                    {room.status}
                                </span>
                            </td>
                            <td style={tdStyle}>{room.floor}</td>
                            <td style={tdStyle}>{room.assignedWorkerId || '-'}</td>
                            <td style={tdStyle}>
                                <button style={btnStyle}>View Details</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'CLEAN': return 'green';
        case 'DIRTY': return 'orange';
        case 'INSPECTING': return 'blue';
        default: return 'gray';
    }
}

const thStyle = {
    padding: 10,
    borderBottom: '2px solid #ccc',
};

const tdStyle = {
    padding: 10,
};

const btnStyle = {
    padding: '5px 10px',
    cursor: 'pointer',
};
