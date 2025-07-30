'use server'

import fs from 'fs';
import path from 'path';
import { createClient } from '@/utils/supabase/server';

export async function uploadSamplePdf() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Read the sample PDF from public folder
    const filePath = path.join(process.cwd(), 'public', 'sample.pdf');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'Sample PDF file not found' };
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Create a filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const filename = `Sample_Learning_Guide_${timestamp}.pdf`;
    const filePathStorage = `${user.id}/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePathStorage, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: 'Failed to upload sample PDF to storage' };
    }

    // Create database entry using the correct table name
    const { data: pdfData, error: dbError } = await supabase
      .from('pdf_documents')
      .insert({
        user_id: user.id,
        filename: 'Sample Learning Guide.pdf',
        file_path: uploadData.path,
        file_size: fileBuffer.length,
        upload_status: 'completed',
        extracted_content: 'Sample PDF content for testing purposes'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return { success: false, error: 'Failed to create database entry' };
    }

    return {
      success: true,
      data: pdfData,
      message: 'Sample PDF uploaded successfully!'
    };

  } catch (error) {
    console.error('Error uploading sample PDF:', error);
    return { success: false, error: 'Failed to upload sample PDF' };
  }
}