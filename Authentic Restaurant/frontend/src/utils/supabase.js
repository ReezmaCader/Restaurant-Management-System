import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mojqhydlpxmkweemxpxt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vanFoeWRscHhta3dlZW14cHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzM0MjQsImV4cCI6MjA2MzgwOTQyNH0.V5zVRusICMXPB_5RF9NvdQf-8a3Aj-zYPnGiNl2q7Fc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadImage = async (file, bucket = 'rms') => {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};
