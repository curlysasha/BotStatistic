import { NextResponse } from 'next/server'
import { analyzeFiles } from '@/lib/file-processor'

export async function GET() {
  try {
    const folderPath = process.env.PHOTO_FOLDER_PATH || './test_data'
    const stats = analyzeFiles(folderPath)
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}