"use server";

// import { createServerActionClient } from '@/utils/supabase/server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// Types
interface PDFDocument {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  upload_status: 'processing' | 'completed' | 'failed';
  extracted_content?: string;
  created_at: string;
}

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get PDF by ID with user authorization
export async function getPDFById(pdfId: string): Promise<ActionResult<PDFDocument>> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    console.log('🔍 Fetching PDF with ID:', pdfId, 'for user:', user.id);

    // Fetch PDF document with RLS protection
    const { data: pdfDoc, error: fetchError } = await supabase
      .from('pdf_documents')
      .select('*')
      .eq('id', pdfId)
      .eq('user_id', user.id) // Ensure user can only access their own PDFs
      .single();

    if (fetchError) {
      console.error('❌ Database error fetching PDF:', fetchError);

      if (fetchError.code === 'PGRST116') {
        return { success: false, error: 'PDF not found or access denied' };
      }

      return { success: false, error: 'Failed to fetch PDF from database' };
    }

    if (!pdfDoc) {
      return { success: false, error: 'PDF not found' };
    }

    console.log('✅ PDF fetched successfully:', pdfDoc.filename);

    return { success: true, data: pdfDoc };

  } catch (error) {
    console.error('❌ Unexpected error in getPDFById:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Get signed URL for PDF content
export async function getPDFContent(pdfId: string): Promise<ActionResult<{ url: string; expiresIn: number }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    // First, verify the PDF belongs to the user
    const pdfResult = await getPDFById(pdfId);

    if (!pdfResult.success || !pdfResult.data) {
      return { success: false, error: pdfResult.error || 'PDF not found' };
    }

    const pdfDoc = pdfResult.data;

    // Generate signed URL for the PDF file
    const expiresIn = 3600; // 1 hour
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('pdfs')
      .createSignedUrl(pdfDoc.file_path, expiresIn);

    if (urlError || !signedUrlData?.signedUrl) {
      console.error('❌ Error creating signed URL:', urlError);
      return { success: false, error: 'Failed to generate PDF access URL' };
    }

    console.log('✅ Signed URL created for PDF:', pdfDoc.filename);

    return {
      success: true,
      data: {
        url: signedUrlData.signedUrl,
        expiresIn
      }
    };

  } catch (error) {
    console.error('❌ Unexpected error in getPDFContent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Get all PDFs for current user (for dashboard)
export async function getUserPDFs(): Promise<ActionResult<PDFDocument[]>> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    console.log('🔍 Fetching all PDFs for user:', user.id);

    // Fetch all PDF documents for the user
    const { data: pdfs, error: fetchError } = await supabase
      .from('pdf_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Database error fetching user PDFs:', fetchError);
      return { success: false, error: 'Failed to fetch PDFs from database' };
    }

    console.log('✅ Fetched', pdfs?.length || 0, 'PDFs for user');

    return { success: true, data: pdfs || [] };

  } catch (error) {
    console.error('❌ Unexpected error in getUserPDFs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Delete PDF (both from database and storage)
export async function deletePDF(pdfId: string): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    // First, get the PDF to find its file path
    const pdfResult = await getPDFById(pdfId);

    if (!pdfResult.success || !pdfResult.data) {
      return { success: false, error: pdfResult.error || 'PDF not found' };
    }

    const pdfDoc = pdfResult.data;

    console.log('🗑️ Deleting PDF:', pdfDoc.filename);

    // Delete from storage first
    const { error: storageError } = await supabase.storage
      .from('pdfs')
      .remove([pdfDoc.file_path]);

    if (storageError) {
      console.error('❌ Error deleting from storage:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('pdf_documents')
      .delete()
      .eq('id', pdfId)
      .eq('user_id', user.id); // Ensure user can only delete their own PDFs

    if (dbError) {
      console.error('❌ Database error deleting PDF:', dbError);
      return { success: false, error: 'Failed to delete PDF from database' };
    }

    console.log('✅ PDF deleted successfully:', pdfDoc.filename);

    return { success: true, data: { deleted: true } };

  } catch (error) {
    console.error('❌ Unexpected error in deletePDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Update PDF metadata (useful for updating extracted content or status)
export async function updatePDFMetadata(
  pdfId: string,
  updates: Partial<Pick<PDFDocument, 'upload_status' | 'extracted_content'>>
): Promise<ActionResult<PDFDocument>> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    // Update the PDF document
    const { data: updatedPdf, error: updateError } = await supabase
      .from('pdf_documents')
      .update(updates)
      .eq('id', pdfId)
      .eq('user_id', user.id) // Ensure user can only update their own PDFs
      .select()
      .single();

    if (updateError) {
      console.error('❌ Database error updating PDF:', updateError);
      return { success: false, error: 'Failed to update PDF metadata' };
    }

    if (!updatedPdf) {
      return { success: false, error: 'PDF not found or access denied' };
    }

    console.log('✅ PDF metadata updated successfully:', updatedPdf.filename);

    return { success: true, data: updatedPdf };

  } catch (error) {
    console.error('❌ Unexpected error in updatePDFMetadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Get PDF statistics for user dashboard
export async function getPDFStats(): Promise<ActionResult<{
  totalPDFs: number;
  totalSize: number;
  completedPDFs: number;
  processingPDFs: number;
  failedPDFs: number;
}>> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    console.log('📊 Fetching PDF statistics for user:', user.id);

    // Get all PDFs for the user
    const { data: pdfs, error: fetchError } = await supabase
      .from('pdf_documents')
      .select('file_size, upload_status')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('❌ Database error fetching PDF stats:', fetchError);
      return { success: false, error: 'Failed to fetch PDF statistics' };
    }

    const stats = {
      totalPDFs: pdfs?.length || 0,
      totalSize: pdfs?.reduce((sum, pdf) => sum + (pdf.file_size || 0), 0) || 0,
      completedPDFs: pdfs?.filter(pdf => pdf.upload_status === 'completed').length || 0,
      processingPDFs: pdfs?.filter(pdf => pdf.upload_status === 'processing').length || 0,
      failedPDFs: pdfs?.filter(pdf => pdf.upload_status === 'failed').length || 0,
    };

    console.log('✅ PDF statistics fetched:', stats);

    return { success: true, data: stats };

  } catch (error) {
    console.error('❌ Unexpected error in getPDFStats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Search PDFs by filename or content
export async function searchPDFs(query: string): Promise<ActionResult<PDFDocument[]>> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    if (!query.trim()) {
      return { success: true, data: [] };
    }

    console.log('🔍 Searching PDFs for query:', query);

    // Search in filename and extracted content
    const { data: pdfs, error: searchError } = await supabase
      .from('pdf_documents')
      .select('*')
      .eq('user_id', user.id)
      .or(`filename.ilike.%${query}%,extracted_content.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (searchError) {
      console.error('❌ Database error searching PDFs:', searchError);
      return { success: false, error: 'Failed to search PDFs' };
    }

    console.log('✅ Found', pdfs?.length || 0, 'PDFs matching query');

    return { success: true, data: pdfs || [] };

  } catch (error) {
    console.error('❌ Unexpected error in searchPDFs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}