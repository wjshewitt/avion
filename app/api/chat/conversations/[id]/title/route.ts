import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { generateConversationTitle } from '@/lib/chat/conversation-title';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    let reason: string | undefined;
    if (req.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await req.json();
        if (body && typeof body.reason === 'string') {
          reason = body.reason;
        }
      } catch {
        // ignore body parse failures for keepalive beacons
      }
    }

    if (reason) {
      console.log('🧠 Conversation title request', { conversationId: id, reason });
    }

    const result = await generateConversationTitle({
      supabase,
      conversationId: id,
      userId: user.id,
    });

    if (!result.title) {
      return NextResponse.json(result, { status: 202 });
    }

    return NextResponse.json(result, { status: result.updated ? 200 : 202 });
  } catch (error) {
    console.error('❌ Conversation title API error', error);
    return NextResponse.json({ error: 'Failed to generate conversation title' }, { status: 500 });
  }
}
