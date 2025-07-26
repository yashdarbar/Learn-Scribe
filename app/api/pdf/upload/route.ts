// /app/api/pdf/upload/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createServerClient } from "@supabase/ssr"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Use the original pattern - this should work with your current Next.js version
    // const supabase = createRouteHandlerClient({ cookies })
    // const cookieStore = await cookies();
    //  const supabase = createServerClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    //   {
    //     cookies: {
    //       get(name: string) {
    //         return cookieStore.get(name)?.value
    //       },
    //     },
    //   }
    // )
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log("user", user);

    // Get the uploaded file from FormData
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log("File", file)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type and size
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json({ error: 'File size too large. Maximum 50MB allowed.' }, { status: 400 })
    }

    // Generate unique file path
    const fileExt = 'pdf'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    console.log("UPLOAD DATA PDF", uploadData);

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

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
      console.error('Database error:', dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('pdfs').remove([uploadData.path])
      return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 })
    }

    // TODO: Queue background job for text extraction
    // For now, we'll set status to 'completed'
    await supabase
      .from('pdf_documents')
      .update({
        upload_status: 'completed',
        extracted_content: 'Text extraction will be implemented in next phase'
      })
      .eq('id', pdfDocument.id)

    return NextResponse.json({
      success: true,
      pdfId: pdfDocument.id,
      message: 'PDF uploaded successfully'
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// // /app/api/pdf/upload/route.ts
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { data } from 'framer-motion/client'
// import { cookies } from 'next/headers'
// import { NextRequest, NextResponse } from 'next/server'

// export async function POST(request: NextRequest) {
//   try {
//     // const cookieStore = await cookies()
//     const supabase = createRouteHandlerClient({ cookies })
//     // const supabase = createRouteHandlerClient({ cookies: () => cookieStore});

//     // Check authentication
//     const { data: { user }, error: authError } = await supabase.auth.getUser()
//     if (authError || !user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     console.log("user", user);

//     // Get the uploaded file from FormData
//     const formData = await request.formData()
//     const file = formData.get('file') as File

//     console.log("File", file)

//     if (!file) {
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 })
//     }

//     // Validate file type and size
//     if (file.type !== 'application/pdf') {
//       return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
//     }

//     if (file.size > 50 * 1024 * 1024) { // 50MB limit
//       return NextResponse.json({ error: 'File size too large. Maximum 50MB allowed.' }, { status: 400 })
//     }

//     // Generate unique file path
//     const fileExt = 'pdf'
//     const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
//     const filePath = `${user.id}/${fileName}`

//     // Upload file to Supabase Storage
//     const { data: uploadData, error: uploadError } = await supabase.storage
//       .from('pdfs')
//       .upload(filePath, file, {
//         cacheControl: '3600',
//         upsert: false
//       })

//       console.log("DRFDATAPDF", uploadData);

//     if (uploadError) {
//       console.error('Upload error:', uploadError)
//       return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
//     }

//     // Save PDF metadata to database
//     const { data: pdfDocument, error: dbError } = await supabase
//       .from('pdf_documents')
//       .insert({
//         user_id: user.id,
//         filename: file.name,
//         file_path: uploadData.path,
//         file_size: file.size,
//         upload_status: 'processing'
//       })
//       .select()
//       .single()

//     if (dbError) {
//       console.error('Database error:', dbError)
//       // Clean up uploaded file if database insert fails
//       await supabase.storage.from('pdfs').remove([uploadData.path])
//       return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 })
//     }

//     // TODO: Queue background job for text extraction
//     // For now, we'll set status to 'completed'
//     // In production, you'd use a background job queue
//     await supabase
//       .from('pdf_documents')
//       .update({
//         upload_status: 'completed',
//         extracted_content: 'Text extraction will be implemented in next phase'
//       })
//       .eq('id', pdfDocument.id)

//     return NextResponse.json({
//       success: true,
//       pdfId: pdfDocument.id,
//       message: 'PDF uploaded successfully'
//     })

//   } catch (error) {
//     console.error('Upload API error:', error)
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }