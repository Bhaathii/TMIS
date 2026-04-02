import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
/**
 * Backup all TMIS data to JSON
 */
export const backupAllData = async () => {
    try {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {
                headers: [],
                layers: [],
                processes: [],
                slittings: [],
            },
        };
        // Backup TMISHeaders
        const headersSnapshot = await getDocs(collection(db, 'TMISHeaders'));
        backup.data.headers = headersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        // Backup TMISLayers
        const layersSnapshot = await getDocs(collection(db, 'TMISLayers'));
        backup.data.layers = layersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        // Backup TMISProcesses
        const processesSnapshot = await getDocs(collection(db, 'TMISProcesses'));
        backup.data.processes = processesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        // Backup TMISSlittings
        const slittingsSnapshot = await getDocs(collection(db, 'TMISSlittings'));
        backup.data.slittings = slittingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return backup;
    }
    catch (error) {
        console.error('Backup error:', error);
        throw new Error(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
/**
 * Download backup as JSON file
 */
export const downloadBackup = async (filename) => {
    try {
        const backup = await backupAllData();
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `tmis-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    }
    catch (error) {
        console.error('Download backup error:', error);
        throw error;
    }
};
/**
 * Get backup file size estimate
 */
export const getBackupSize = async () => {
    try {
        const backup = await backupAllData();
        const json = JSON.stringify(backup);
        const bytes = new Blob([json]).size;
        return formatBytes(bytes);
    }
    catch (error) {
        return 'Error calculating size';
    }
};
/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i];
};
/**
 * Get backup statistics
 */
export const getBackupStats = async () => {
    try {
        const headersSnapshot = await getDocs(collection(db, 'TMISHeaders'));
        const layersSnapshot = await getDocs(collection(db, 'TMISLayers'));
        const processesSnapshot = await getDocs(collection(db, 'TMISProcesses'));
        const slittingsSnapshot = await getDocs(collection(db, 'TMISSlittings'));
        return {
            headers: headersSnapshot.size,
            layers: layersSnapshot.size,
            processes: processesSnapshot.size,
            slittings: slittingsSnapshot.size,
            total: headersSnapshot.size + layersSnapshot.size + processesSnapshot.size + slittingsSnapshot.size,
            lastBackup: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error('Error getting backup stats:', error);
        throw error;
    }
};
