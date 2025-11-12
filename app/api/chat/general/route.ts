/**
 * General Weather Chat API Route
 * Handles conversational AI for airport weather queries (no specific flight required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendGeneralChatMessage, calculateGeneralChatCost } from '@/lib/gemini/general-chat-client';
import type { Database } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId } = await req.json();
    
    // Validate request
    if (!message) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 1. Get or create conversation
    let convId = conversationId;
    let conversationHistory: any[] = [];
    
    if (!convId) {
      // Create new general conversation (no flight_id)
      const newConversation = {
        user_id: user.id,
        title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        chat_type: 'general',
        flight_id: null
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
      const { data: messages, error: msgError} = (await (supabase
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
    
    // 2. Send to Gemini with general weather tools and flight data tools
    const { 
      message: aiResponse, 
      tokensUsed, 
      toolCalls,
      modelUsed,
      weatherData,
      airportData 
    } = await sendGeneralChatMessage(
      conversationHistory,
      message,
      user.id // Pass user ID for flight data tools
    ) as any;
    
    // 3. Save messages to database
    const messagesToInsert = [
      {
        conversation_id: convId,
        role: 'user',
        content: message,
        tokens_used: null,
        weather_tool_data: null,
        airport_tool_data: null
      },
      {
        conversation_id: convId,
        role: 'assistant',
        content: aiResponse,
        tokens_used: tokensUsed,
        weather_tool_data: weatherData ? weatherData : null,
        airport_tool_data: airportData ? airportData : null
      }
    ];
    
    const { error: insertError } = (await (supabase
      .from('chat_messages') as any)
      .insert(messagesToInsert)) as { error: any };
    
    if (insertError) {
      console.error('Error saving messages:', insertError);
      // Don't throw - we have the AI response, just log the error
    }
    
    // 4. Log usage for cost tracking
    const costUsd = calculateGeneralChatCost(tokensUsed.input, tokensUsed.output);
    
    const { error: usageError } = (await (supabase
      .from('gemini_usage_logs') as any)
      .insert({
        conversation_id: convId,
        flight_id: null,
        input_tokens: tokensUsed.input,
        output_tokens: tokensUsed.output,
        cost_usd: costUsd,
        model: modelUsed
      })) as { error: any };
    
    if (usageError) {
      console.error('Error logging usage:', usageError);
      // Don't throw - non-critical
    }
    
    // 5. Update conversation updated_at
    await (supabase
      .from('chat_conversations') as any)
      .update({ updated_at: new Date().toISOString() })
      .eq('id', convId);
    
    return NextResponse.json({
      conversationId: convId,
      message: aiResponse,
      tokensUsed,
      cost: costUsd,
      toolCalls: toolCalls || [],
      modelUsed: modelUsed || 'gemini-2.5-flash',
      weatherData: weatherData || null, // Weather data for popup display
      airportData: airportData || null // Airport data for popup display
    });
    
  } catch (error) {
    console.error('General Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
