import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy, Timestamp, } from 'firebase/firestore';
import { db } from '../firebase/config';
// Helper function to convert Firestore Timestamps to JavaScript Dates
const convertTimestamps = (data) => {
    if (!data)
        return data;
    const converted = { ...data };
    // Convert TMISIssueDate
    if (converted.TMISIssueDate) {
        if (converted.TMISIssueDate instanceof Timestamp) {
            converted.TMISIssueDate = converted.TMISIssueDate.toDate();
        }
        else if (typeof converted.TMISIssueDate === 'string') {
            converted.TMISIssueDate = new Date(converted.TMISIssueDate);
        }
    }
    // Convert createdAt
    if (converted.createdAt) {
        if (converted.createdAt instanceof Timestamp) {
            converted.createdAt = converted.createdAt.toDate();
        }
        else if (typeof converted.createdAt === 'string') {
            converted.createdAt = new Date(converted.createdAt);
        }
    }
    // Convert updatedAt
    if (converted.updatedAt) {
        if (converted.updatedAt instanceof Timestamp) {
            converted.updatedAt = converted.updatedAt.toDate();
        }
        else if (typeof converted.updatedAt === 'string') {
            converted.updatedAt = new Date(converted.updatedAt);
        }
    }
    // Convert loginTime
    if (converted.loginTime) {
        if (converted.loginTime instanceof Timestamp) {
            converted.loginTime = converted.loginTime.toDate();
        }
        else if (typeof converted.loginTime === 'string') {
            converted.loginTime = new Date(converted.loginTime);
        }
    }
    // Convert timestamp (for activity logs)
    if (converted.timestamp) {
        if (converted.timestamp instanceof Timestamp) {
            converted.timestamp = converted.timestamp.toDate();
        }
        else if (typeof converted.timestamp === 'string') {
            converted.timestamp = new Date(converted.timestamp);
        }
    }
    return converted;
};
// TMIS Header operations
export const addTMISHeader = async (data) => {
    const docRef = await addDoc(collection(db, 'TMIS_Header'), {
        ...data,
        TMISIssueDate: Timestamp.fromDate(new Date(data.TMISIssueDate)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
};
export const updateTMISHeader = async (id, data) => {
    const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
    };
    if (data.TMISIssueDate) {
        updateData.TMISIssueDate = Timestamp.fromDate(new Date(data.TMISIssueDate));
    }
    await updateDoc(doc(db, 'TMIS_Header', id), updateData);
};
export const getTMISHeader = async (id) => {
    const docSnap = await getDoc(doc(db, 'TMIS_Header', id));
    if (docSnap.exists()) {
        return convertTimestamps({ id: docSnap.id, ...docSnap.data() });
    }
    return null;
};
export const getAllTMISHeaders = async () => {
    const querySnapshot = await getDocs(query(collection(db, 'TMIS_Header'), orderBy('createdAt', 'desc')));
    return querySnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
};
export const searchTMISByTapeCode = async (tapeCode) => {
    // Get all headers and filter in memory to avoid needing composite indexes
    const allHeaders = await getAllTMISHeaders();
    return allHeaders.filter((header) => header.TapeCode.toUpperCase().includes(tapeCode.toUpperCase()));
};
export const filterTMISByStatus = async (status) => {
    const querySnapshot = await getDocs(query(collection(db, 'TMIS_Header'), where('Status', '==', status)));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
export const deleteTMISHeader = async (id) => {
    // Delete header
    await deleteDoc(doc(db, 'TMIS_Header', id));
    // Delete associated records
    await deleteLayersByHeaderId(id);
    await deleteProcessesByHeaderId(id);
    await deleteSlittingsByHeaderId(id);
};
// TMIS Layers operations
export const addTMISLayer = async (data) => {
    const docRef = await addDoc(collection(db, 'TMIS_Layers'), data);
    return docRef.id;
};
export const updateTMISLayer = async (id, data) => {
    await updateDoc(doc(db, 'TMIS_Layers', id), data);
};
export const deleteTMISLayer = async (id) => {
    await deleteDoc(doc(db, 'TMIS_Layers', id));
};
export const getLayersByHeaderId = async (headerId) => {
    const querySnapshot = await getDocs(query(collection(db, 'TMIS_Layers'), where('headerId', '==', headerId)));
    const layers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return layers.sort((a, b) => a.LayerNo - b.LayerNo);
};
export const deleteLayersByHeaderId = async (headerId) => {
    const layers = await getLayersByHeaderId(headerId);
    for (const layer of layers) {
        await deleteTMISLayer(layer.id);
    }
};
// TMIS Processes operations
export const addTMISProcess = async (data) => {
    const docRef = await addDoc(collection(db, 'TMIS_Processes'), data);
    return docRef.id;
};
export const updateTMISProcess = async (id, data) => {
    await updateDoc(doc(db, 'TMIS_Processes', id), data);
};
export const deleteTMISProcess = async (id) => {
    await deleteDoc(doc(db, 'TMIS_Processes', id));
};
export const getProcessesByHeaderId = async (headerId) => {
    const querySnapshot = await getDocs(query(collection(db, 'TMIS_Processes'), where('headerId', '==', headerId)));
    const processes = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return processes.sort((a, b) => a.ProcessLetter.localeCompare(b.ProcessLetter));
};
export const deleteProcessesByHeaderId = async (headerId) => {
    const processes = await getProcessesByHeaderId(headerId);
    for (const process of processes) {
        await deleteTMISProcess(process.id);
    }
};
// TMIS Slitting operations
export const addTMISSlitting = async (data) => {
    const docRef = await addDoc(collection(db, 'TMIS_Slitting'), data);
    return docRef.id;
};
export const updateTMISSlitting = async (id, data) => {
    await updateDoc(doc(db, 'TMIS_Slitting', id), data);
};
export const deleteTMISSlitting = async (id) => {
    await deleteDoc(doc(db, 'TMIS_Slitting', id));
};
export const getSlittingsByHeaderId = async (headerId) => {
    const querySnapshot = await getDocs(query(collection(db, 'TMIS_Slitting'), where('headerId', '==', headerId)));
    const slittings = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return slittings.sort((a, b) => a.RowNo - b.RowNo);
};
export const deleteSlittingsByHeaderId = async (headerId) => {
    const slittings = await getSlittingsByHeaderId(headerId);
    for (const slitting of slittings) {
        await deleteTMISSlitting(slitting.id);
    }
};
// Login History operations
export const recordLogin = async (uid, email) => {
    try {
        await addDoc(collection(db, 'loginHistory'), {
            uid,
            email,
            loginTime: Timestamp.now(),
            userAgent: navigator.userAgent,
        });
    }
    catch (error) {
        console.error('Error recording login:', error);
        // Don't throw error - this shouldn't block login
    }
};
export const getLoginHistoryForUser = async (uid) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'loginHistory'), where('uid', '==', uid), orderBy('loginTime', 'desc')));
        return querySnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error fetching login history:', error);
        return [];
    }
};
export const getAllLoginHistory = async () => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'loginHistory'), orderBy('loginTime', 'desc')));
        return querySnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error fetching all login history:', error);
        return [];
    }
};
// Activity Log operations
export const logActivity = async (uid, email, action, resourceType, description, resourceId) => {
    try {
        await addDoc(collection(db, 'activityLog'), {
            uid,
            email,
            action,
            resourceType,
            resourceId,
            description,
            timestamp: Timestamp.now(),
        });
    }
    catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw error - this shouldn't block operations
    }
};
export const getActivityLogForUser = async (uid) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'activityLog'), where('uid', '==', uid), orderBy('timestamp', 'desc')));
        return querySnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error fetching activity log:', error);
        return [];
    }
};
export const getAllActivityLog = async () => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'activityLog'), orderBy('timestamp', 'desc')));
        return querySnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error fetching all activity log:', error);
        return [];
    }
};
// FTR Report operations
export const getLatestFTRNumber = async () => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'FTR_Reports'), orderBy('ftrNumber', 'desc')));
        if (querySnapshot.docs.length === 0) {
            return 1001; // Starting number
        }
        const latest = querySnapshot.docs[0].data();
        return (latest.ftrNumber || 1001) + 1;
    }
    catch (error) {
        console.error('Error fetching latest FTR number:', error);
        return 1001; // Default to starting number on error
    }
};
export const saveFTRReport = async (ftrData) => {
    try {
        const docRef = await addDoc(collection(db, 'FTR_Reports'), {
            ...ftrData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return docRef.id;
    }
    catch (error) {
        console.error('Error saving FTR report:', error);
        throw error;
    }
};
export const getAllFTRReports = async () => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'FTR_Reports'), orderBy('createdAt', 'desc')));
        return querySnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error fetching FTR reports:', error);
        return [];
    }
};
