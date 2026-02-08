import ImageKit from '@imagekit/nodejs'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Inisialisasi ImageKit
  const imagekit = new ImageKit({
    privateKey: config.imagekitPrivateKey,
  })

  // Baca form data (Multipart)
  const formData = await readMultipartFormData(event)
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'No data provided' })

  const fileData = formData.find(item => item.name === 'file')
  if (!fileData || !fileData.data) {
    throw createError({ statusCode: 400, statusMessage: 'No file found in request' })
  }

  try {
    const uploadResponse = await imagekit.upload({
      file: fileData.data, // Buffer data
      fileName: fileData.filename || 'upload.jpg',
      folder: '/questionnaire-uploads/'
    })

    return { url: uploadResponse.url }
  } catch (error: any) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || 'ImageKit Upload Failed' 
    })
  }
})