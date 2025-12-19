import { NextRequest } from 'next/server'
import { ApiResponse, apiHandler } from '@/lib/api-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

/**
 * File Virus Scanning
 * Uses ClamAV or VirusTotal API for scanning uploaded files
 */

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3'

interface ScanResult {
    safe: boolean
    scanId?: string
    detections?: number
    scanDate?: Date
    details?: any
}

/**
 * Scan file for viruses using VirusTotal
 */
export async function scanFileWithVirusTotal(
    fileBuffer: Buffer,
    fileName: string
): Promise<ScanResult> {
    if (!VIRUSTOTAL_API_KEY) {
        console.warn('VirusTotal API key not configured, skipping virus scan')
        return { safe: true }
    }

    try {
        // Calculate file hash
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex')

        // First, check if file hash already exists in VirusTotal
        const lookupResponse = await fetch(
            `${VIRUSTOTAL_API_URL}/files/${hash}`,
            {
                headers: {
                    'x-apikey': VIRUSTOTAL_API_KEY,
                },
            }
        )

        if (lookupResponse.ok) {
            const data = await lookupResponse.json()
            const stats = data.data.attributes.last_analysis_stats

            const detections = stats.malicious + stats.suspicious

            return {
                safe: detections === 0,
                scanId: data.data.id,
                detections,
                scanDate: new Date(data.data.attributes.last_analysis_date * 1000),
                details: stats,
            }
        }

        // If not found, upload and scan
        const formData = new FormData()
        formData.append('file', new Blob([new Uint8Array(fileBuffer)]), fileName)

        const uploadResponse = await fetch(`${VIRUSTOTAL_API_URL}/files`, {
            method: 'POST',
            headers: {
                'x-apikey': VIRUSTOTAL_API_KEY,
            },
            body: formData,
        })

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload file to VirusTotal')
        }

        const uploadData = await uploadResponse.json()
        const analysisId = uploadData.data.id

        // Wait a bit for analysis to complete
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Get analysis results
        const analysisResponse = await fetch(
            `${VIRUSTOTAL_API_URL}/analyses/${analysisId}`,
            {
                headers: {
                    'x-apikey': VIRUSTOTAL_API_KEY,
                },
            }
        )

        if (!analysisResponse.ok) {
            throw new Error('Failed to get analysis results')
        }

        const analysisData = await analysisResponse.json()
        const stats = analysisData.data.attributes.stats

        const detections = stats.malicious + stats.suspicious

        return {
            safe: detections === 0,
            scanId: analysisId,
            detections,
            scanDate: new Date(),
            details: stats,
        }
    } catch (error) {
        console.error('VirusTotal scan error:', error)
        // In case of error, fail safe and reject the file
        return {
            safe: false,
            detections: -1,
        }
    }
}

/**
 * Scan file using ClamAV (local installation required)
 */
export async function scanFileWithClamAV(
    filePath: string
): Promise<ScanResult> {
    // This requires ClamAV to be installed on the server
    // Installation: apt-get install clamav clamav-daemon

    try {
        const { exec } = require('child_process')
        const { promisify } = require('util')
        const execAsync = promisify(exec)

        const { stdout, stderr } = await execAsync(`clamscan ${filePath}`)

        const isSafe = !stdout.includes('FOUND') && !stderr

        return {
            safe: isSafe,
            scanDate: new Date(),
            details: { stdout, stderr },
        }
    } catch (error) {
        console.error('ClamAV scan error:', error)
        return {
            safe: false,
            detections: -1,
        }
    }
}

/**
 * API endpoint to scan uploaded file
 */
export const POST = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return ApiResponse.error('No file provided')
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Scan file
        const scanResult = await scanFileWithVirusTotal(buffer, file.name)

        if (!scanResult.safe) {
            return ApiResponse.error('File failed virus scan', 400, {
                file: ['This file may contain malicious content and cannot be uploaded'],
            })
        }

        return ApiResponse.success({
            safe: true,
            message: 'File passed virus scan',
            scanId: scanResult.scanId,
        })
    } catch (error) {
        console.error('File scan error:', error)
        return ApiResponse.serverError('Failed to scan file')
    }
})

/**
 * Validate file before upload
 */
export function validateFile(
    file: File,
    options: {
        maxSize?: number
        allowedTypes?: string[]
        allowedExtensions?: string[]
    } = {}
): { valid: boolean; error?: string } {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = [],
        allowedExtensions = [],
    } = options

    // Check file size
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
        }
    }

    // Check MIME type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed`,
        }
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
        const extension = file.name.split('.').pop()?.toLowerCase()
        if (!extension || !allowedExtensions.includes(extension)) {
            return {
                valid: false,
                error: `File extension .${extension} is not allowed`,
            }
        }
    }

    return { valid: true }
}
