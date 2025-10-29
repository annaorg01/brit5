
import { API_BASE_URL, API_PROJECT_PATH, API_KEY, BATCH_SIZE, MAX_RETRIES } from '../constants';
import type { Lead } from '../types';

export const fetchAllLeads = async (): Promise<Lead[]> => {
    let allData: Lead[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        let attempt = 0;
        let success = false;
        
        while (!success && attempt < MAX_RETRIES) {
            try {
                const url = `${API_BASE_URL}${API_PROJECT_PATH}?limit=${BATCH_SIZE}&offset=${offset}`;
                const response = await fetch(url, {
                    headers: { 'x-api-key': API_KEY }
                });

                if (!response.ok) {
                    throw new Error(`שגיאת HTTP! סטטוס: ${response.status}`);
                }
                
                const data = await response.json();

                if (data && data.rows && Array.isArray(data.rows)) {
                    if (data.rows.length > 0) {
                        allData = allData.concat(data.rows);
                        offset += BATCH_SIZE;
                    }
                    if (data.rows.length < BATCH_SIZE) {
                        hasMore = false;
                    }
                    success = true;
                } else {
                    console.warn('API response format is not as expected:', data);
                    hasMore = false; // Stop if format is wrong
                    success = true;
                }
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                attempt++;
                if (attempt >= MAX_RETRIES) {
                    hasMore = false;
                    throw new Error("נכשל באחזור כל הנתונים לאחר מספר ניסיונות.");
                }
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    return allData;
};
