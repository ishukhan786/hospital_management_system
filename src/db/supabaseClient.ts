import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzzqdhkffjjjbwnfmcup.supabase.co';
const supabaseAnonKey = 'sb_publishable_dUhg7dIJBKFHfxxzguLCSw_5dmdLPGT';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
