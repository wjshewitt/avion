/**
 * Conversations API Route
 * Handles listing and creating chat conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get chat type filter from query params
    const { searchParams } = new URL(req.url);
    const chatType = searchParams.get('type'); // 'general' or 'flight'
    
    // Fetch conversations with message count
    let query = supabase
      .from('chat_conversations')
      .select(`
        id,
        title,
        chat_type,
        created_at,
        updated_at,
        flight_id
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(100);
    
    if (chatType) {
      query = query.eq('chat_type', chatType);
    }
    
    const { data: conversations, error: convError } = await query;

    if (convError) {
      const errorMessage = convError.message?.toLowerCase?.() ?? '';
      const isMissingChatTypeColumn = errorMessage.includes('chat_type');

      if (chatType === 'general' && isMissingChatTypeColumn) {
        console.warn(
          'General chat support migration not applied yet; returning empty conversation list.',
          {
            hint: 'Run supabase/migrations/20251109000001_add_general_chat_support.sql',
            originalError: convError
          }
        );

        return NextResponse.json({ conversations: [] });
      }

      console.error('Error fetching conversations:', convError);
      throw new Error('Failed to fetch conversations');
    }
    
    // For each conversation, get message count and last message
    const conversationsWithMeta = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        // Get message count
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id);
        
        // Get last message preview
        const { data: lastMsg } = await supabase
          .from('chat_messages')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Use maybeSingle to avoid error if no messages
        
        return {
          id: conv.id,
          title: conv.title,
          chat_type: conv.chat_type ?? 'flight',
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          flight_id: conv.flight_id,
          message_count: count || 0,
          last_message_preview: (lastMsg as any)?.content?.substring(0, 60) || '',
        };
      })
    );
    
    return NextResponse.json({
      conversations: conversationsWithMeta
    });
    
  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { chat_type = 'general', title = 'New Conversation', flight_id = null } = await req.json();
    
    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        chat_type,
        title,
        flight_id
      } as any)
      .select()
      .single();
    
    if (convError) {
      console.error('Error creating conversation:', convError);
      throw new Error('Failed to create conversation');
    }
    
    return NextResponse.json({
      conversation
    });
    
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
