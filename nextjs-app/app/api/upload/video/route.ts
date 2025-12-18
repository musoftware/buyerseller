import { NextRequest } from 'next/server'
import { ApiResponse, apiHandler } from '@/lib/api-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Video Upload for Gigs
 * Supports video demos and promotional content
 */

const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_VIDEO_FORMATS = ['mp4', 'mov', 'avi', 'webm', 'mkv']
const MAX_VIDEO_DURATION = 120 // 2 minutes in seconds

/**
 * Upload video to Cloudinary
 */
export const POST = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    try {
        const formData = await request.formData()
        const file = formData.get('video') as File
        const gigId = formData.get('gigId') as string

        if (!file) {
            return ApiResponse.error('No video file provided')
        }

        // Validate file size
        if (file.size > MAX_VIDEO_SIZE) {
            return ApiResponse.error(
                `Video size exceeds maximum allowed size of ${MAX_VIDEO_SIZE / 1024 / 1024}MB`
            )
        }

        // Validate file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (!fileExtension || !ALLOWED_VIDEO_FORMATS.includes(fileExtension)) {
            return ApiResponse.error(
                `Invalid video format. Allowed formats: ${ALLOWED_VIDEO_FORMATS.join(', ')}`
            )
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video',
                    folder: 'gigstream/videos',
                    public_id: `${gigId}_${Date.now()}`,
                    transformation: [
                        { quality: 'auto' },
                        { fetch_format: 'auto' },
                    ],
                    eager: [
                        { width: 1280, height: 720, crop: 'limit', quality: 'auto', format: 'mp4' },
                        { width: 640, height: 360, crop: 'limit', quality: 'auto', format: 'mp4' },
                    ],
                    eager_async: true,
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )

            uploadStream.end(buffer)
        })

        // Validate video duration
        if (result.duration && result.duration > MAX_VIDEO_DURATION) {
            // Delete the uploaded video
            await cloudinary.uploader.destroy(result.public_id, { resource_type: 'video' })
            return ApiResponse.error(
                `Video duration exceeds maximum allowed duration of ${MAX_VIDEO_DURATION} seconds`
            )
        }

        // TODO: Save video URL to database

        return ApiResponse.success({
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration,
            format: result.format,
            width: result.width,
            height: result.height,
            size: result.bytes,
            thumbnail: result.eager?.[0]?.secure_url,
        })
    } catch (error) {
        console.error('Video upload error:', error)
        return ApiResponse.serverError('Failed to upload video')
    }
})

/**
 * Delete video from Cloudinary
 */
export const DELETE = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
        return ApiResponse.error('Public ID is required')
    }

    try {
        // TODO: Verify user owns this video

        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })

        // TODO: Remove from database

        return ApiResponse.success({ message: 'Video deleted successfully' })
    } catch (error) {
        console.error('Video deletion error:', error)
        return ApiResponse.serverError('Failed to delete video')
    }
})

/**
 * Get video info
 */
export const GET = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
        return ApiResponse.error('Public ID is required')
    }

    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: 'video',
        })

        return ApiResponse.success({
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration,
            format: result.format,
            width: result.width,
            height: result.height,
            size: result.bytes,
            createdAt: result.created_at,
        })
    } catch (error) {
        console.error('Video info error:', error)
        return ApiResponse.serverError('Failed to get video info')
    }
})
