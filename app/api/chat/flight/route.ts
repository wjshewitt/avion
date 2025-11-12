/**
 * Flight Chat API Route
 * Handles conversational AI interactions about specific flights
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildFlightContext } from '@/lib/gemini/context-builder';
import { sendChatMessage, calculateCost } from '@/lib/gemini/chat-client';
import type { Database } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const { flightId, message, conversationId } = await req.json();
    
    // Validate request
    if (!flightId || !message) {
      return NextResponse.json(
        { error: 'flightId and message are required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user has access to this flight
    const { data: flight, error: flightError } = await supabase
      .from('user_flights')
      .select('id')
      .eq('id', flightId)
      .eq('user_id', user.id)
      .single();
    
    if (flightError || !flight) {
      return NextResponse.json({ error: 'Flight not found or access denied' }, { status: 404 });
    }
    
    // 1. Get or create conversation
    let convId = conversationId;
    let conversationHistory: any[] = [];
    
    if (!convId) {
      // Create new conversation
      type ConversationInsert = Database['public']['Tables']['chat_conversations']['Insert'];
      const newConversation: ConversationInsert = {
        flight_id: flightId,
        user_id: user.id,
        title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        chat_type: 'flight'
      };
      
      const { data: newConv, error: convError } = (await (supabase
        .from('chat_conversations') as any)
        .insert(newConversation)
        .select()
        .single()) as { data: any; error: any };
      
      if (convError) {
        console.error('Error creating conversation:', convError);
        throw new Error('Failed to create conversation');
      }
      
      convId = newConv.id;
    } else {
      // Load existing conversation history
      const { data: messages, error: msgError } = (await (supabase
        .from('chat_messages') as any)
        .select('role, content')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })) as { data: any; error: any };
      
      if (msgError) {
        console.error('Error loading conversation history:', msgError);
        throw new Error('Failed to load conversation history');
      }
      
      conversationHistory = messages || [];
    }
    
    // 2. Build flight context (only needed for first message)
    let flightContext = '';
    if (conversationHistory.length === 0) {
      const { contextString } = await buildFlightContext(flightId);
      flightContext = contextString;
    }
    
    // 3. Send to Gemini with tool calling support
    const { 
      message: aiResponse, 
      tokensUsed, 
      dataRefreshed, 
      modelUsed 
    } = await sendChatMessage(
      flightId,
      user.id,
      flightContext,
      conversationHistory,
      message
    );
    
    // 4. Save messages to database
    const messagesToInsert = [
      {
        conversation_id: convId,
        role: 'user',
        content: message,
        tokens_used: null
      },
      {
        conversation_id: convId,
        role: 'assistant',
        content: aiResponse,
        tokens_used: tokensUsed
      }
    ];
    
    const { error: insertError } = (await (supabase
      .from('chat_messages') as any)
      .insert(messagesToInsert)) as { error: any };
    
    if (insertError) {
      console.error('Error saving messages:', insertError);
      // Don't throw - we have the AI response, just log the error
    }
    
    // 5. Log usage for cost tracking
    const costUsd = calculateCost(tokensUsed.input, tokensUsed.output, modelUsed);
    
    const { error: usageError } = (await (supabase
      .from('gemini_usage_logs') as any)
      .insert({
        conversation_id: convId,
        flight_id: flightId,
        input_tokens: tokensUsed.input,
        output_tokens: tokensUsed.output,
        cost_usd: costUsd,
        model: modelUsed || 'gemini-2.5-flash-lite',
        data_refreshed: dataRefreshed || false
      })) as { error: any };
    
    if (usageError) {
      console.error('Error logging usage:', usageError);
      // Don't throw - non-critical
    }
    
    // 6. Update conversation updated_at
    await (supabase
      .from('chat_conversations') as any)
      .update({ updated_at: new Date().toISOString() })
      .eq('id', convId);
    
    return NextResponse.json({
      conversationId: convId,
      message: aiResponse,
      tokensUsed,
      cost: costUsd,
      dataRefreshed: dataRefreshed || false,
      modelUsed: modelUsed || 'gemini-2.5-flash-lite'
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
