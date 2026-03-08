import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const dataSource = import.meta.env.VITE_DATA_SOURCE || 'csv';

const isSupabaseConfigured =
    supabaseUrl &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your_supabase_anon_key_here';

let supabase = null;
if (isSupabaseConfigured) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
    }
}

console.log('Data Source:', dataSource);

export const fetchSalesData = async () => {
    try {
        if (dataSource === 'supabase' && supabase) {
            console.log('Fetching from Supabase');
            return await fetchFromSupabase();
        }
        console.log('Fetching from CSV');
        return await fetchFromCSV();
    } catch (err) {
        console.error('fetchSalesData failed:', err);
        throw err;
    }
};

const fetchFromSupabase = async () => {
    const { data, error } = await supabase
        .from('sales_data')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.error('Supabase Error:', error);
        throw error;
    }
    return data;
};

const fetchFromCSV = async () => {
    try {
        const response = await fetch('/Data/sales_data.csv');
        const text = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(text, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const sorted = results.data.sort((a, b) => new Date(a.date) - new Date(b.date));
                    resolve(sorted);
                },
                error: (err) => reject(err)
            });
        });
    } catch (error) {
        console.error('CSV Fetch Error:', error);
        throw error;
    }
};
