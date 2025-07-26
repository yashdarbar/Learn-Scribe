// lib/actions/pdf-upload.ts
'use server'

// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export type UploadResult = {
  success: boolean
  pdfId?: string
  message: string
  error?: string
}

export async function uploadPDF(formData: FormData): Promise<UploadResult> {
  try {
    console.log('🚀 Server Action: Starting PDF upload...')

    // Create Supabase client
    // const supabase = createServerComponentClient({ cookies })
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log("mae", user);

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return {
        success: false,
        message: 'Unauthorized. Please log in.',
        error: 'AUTH_ERROR'
      }
    }

    console.log('✅ User authenticated:', user.id)

    // Get the uploaded file from FormData
    const file = formData.get('file') as File

    if (!file || file.size === 0) {
      console.error('❌ No file provided')
      return {
        success: false,
        message: 'No file provided',
        error: 'NO_FILE'
      }
    }

    console.log('📄 Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.error('❌ Invalid file type:', file.type)
      return {
        success: false,
        message: 'Only PDF files are allowed',
        error: 'INVALID_FILE_TYPE'
      }
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size)
      return {
        success: false,
        message: 'File size too large. Maximum 50MB allowed.',
        error: 'FILE_TOO_LARGE'
      }
    }

    // Generate unique file path
    const fileExt = 'pdf'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    console.log('📁 Generated file path:', filePath)

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError)
      return {
        success: false,
        message: 'Failed to upload file to storage',
        error: 'UPLOAD_ERROR'
      }
    }

    console.log('✅ File uploaded to storage:', uploadData.path)

    // Save PDF metadata to database
    const { data: pdfDocument, error: dbError } = await supabase
      .from('pdf_documents')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        upload_status: 'processing'
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Database error:', dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('pdfs').remove([uploadData.path])
      return {
        success: false,
        message: 'Failed to save file metadata',
        error: 'DATABASE_ERROR'
      }
    }

    console.log('✅ PDF record created:', pdfDocument.id)

    // Update status to completed (in real app, you'd queue background job for text extraction)
    const { error: updateError } = await supabase
      .from('pdf_documents')
      .update({
        upload_status: 'completed',
        extracted_content: 'Text extraction will be implemented in next phase'
      })
      .eq('id', pdfDocument.id)

    if (updateError) {
      console.error('⚠️ Update error (non-critical):', updateError)
    }

    // Revalidate the PDF library page to show the new PDF
    revalidatePath('/pdf')
    revalidatePath('/dashboard')

    console.log('🎉 Upload completed successfully')

    return {
      success: true,
      pdfId: pdfDocument.id,
      message: 'PDF uploaded successfully!'
    }

  } catch (error) {
    console.error('💥 Server action error:', error)
    return {
      success: false,
      message: 'Internal server error. Please try again.',
      error: 'INTERNAL_ERROR'
    }
  }
}

// Additional server action to get user's PDFs for the library page
export async function getUserPDFs() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: pdfs, error } = await supabase
      .from('pdf_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return pdfs || []
  } catch (error) {
    console.error('Error fetching PDFs:', error)
    return []
  }
}

// Server action to delete a PDF
export async function deletePDF(pdfId: string): Promise<UploadResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'AUTH_ERROR'
      }
    }

    // Get PDF document to get file path
    const { data: pdfDoc, error: fetchError } = await supabase
      .from('pdf_documents')
      .select('file_path')
      .eq('id', pdfId)
      .eq('user_id', user.id) // Ensure user owns the PDF
      .single()

    if (fetchError || !pdfDoc) {
      return {
        success: false,
        message: 'PDF not found',
        error: 'NOT_FOUND'
      }
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('pdfs')
      .remove([pdfDoc.file_path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('pdf_documents')
      .delete()
      .eq('id', pdfId)
      .eq('user_id', user.id)

    if (dbError) {
      console.error('Database deletion error:', dbError)
      return {
        success: false,
        message: 'Failed to delete PDF',
        error: 'DATABASE_ERROR'
      }
    }

    // Revalidate pages
    revalidatePath('/pdf')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'PDF deleted successfully'
    }

  } catch (error) {
    console.error('Delete PDF error:', error)
    return {
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }
  }
}