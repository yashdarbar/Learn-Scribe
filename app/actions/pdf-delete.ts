'use server'

import { createClient } from '@/utils/supabase/server';

export type DeleteResult = {
  success: boolean;
  message: string;
  error?: string;
}

export async function deletePDF(pdfId: string): Promise<DeleteResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        success: false,
        message: 'User not authenticated',
        error: 'AUTH_ERROR'
      };
    }

    // Get PDF document to get file path
    const { data: pdfDoc, error: fetchError } = await supabase
      .from('pdf_documents')
      .select('file_path, filename')
      .eq('id', pdfId)
      .eq('user_id', user.id) // Ensure user owns the PDF
      .single();

    if (fetchError || !pdfDoc) {
      return {
        success: false,
        message: 'PDF not found',
        error: 'NOT_FOUND'
      };
    }

    // Delete from storage first
    if (pdfDoc.file_path) {
      const { error: storageError } = await supabase.storage
        .from('pdfs')
        .remove([pdfDoc.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('pdf_documents')
      .delete()
      .eq('id', pdfId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return {
        success: false,
        message: 'Failed to delete PDF',
        error: 'DATABASE_ERROR'
      };
    }

    return {
      success: true,
      message: `PDF "${pdfDoc.filename}" deleted successfully`
    };

  } catch (error) {
    console.error('Delete PDF error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    };
  }
}