import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('sales_data')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
    }
}
