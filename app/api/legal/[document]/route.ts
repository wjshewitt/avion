import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ document: string }> }
) {
  try {
    const { document } = await params;
    
    // Map document IDs to filenames
    const documentMap: Record<string, string> = {
      terms: 'TERMS_OF_SERVICE.md',
      privacy: 'PRIVACY_POLICY.md',
      liability: 'LIABILITY_DISCLAIMER.md',
      aviation: 'AVIATION_DISCLAIMERS.md',
    };

    const filename = documentMap[document];
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Read the markdown file from the legal directory
    const legalDir = path.join(process.cwd(), 'legal');
    const filePath = path.join(legalDir, filename);
    const content = await fs.readFile(filePath, 'utf-8');

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error reading legal document:', error);
    return NextResponse.json(
      { error: 'Failed to load document' },
      { status: 500 }
    );
  }
}
