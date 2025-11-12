/**
 * General Weather Chat API Route
 * Handles conversational AI for airport weather queries (no specific flight required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendGeneralChatMessage, sendGeneralChatMessageStream, calculateGeneralChatCost } from '@/lib/gemini/general-chat-client';
import type { Database } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, streaming = false } = await req.json();
    
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
    
    // 2. Handle streaming vs non-streaming
    if (streaming) {
      // STREAMING MODE: Return SSE stream
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let finalContent = '';
            let finalThinking = '';
            let finalTokens: { input: number; output: number; thinking?: number } = { input: 0, output: 0, thinking: 0 };
            let finalToolCalls: any[] = [];
            let finalWeatherData: any[] = [];
            let finalAirportData: any[] = [];
            let finalModel = 'gemini-2.5-flash';
            
            // Stream chunks from Gemini
            for await (const chunk of sendGeneralChatMessageStream(
              conversationHistory,
              message,
              user.id
            )) {
              // Send chunk to client
              const data = JSON.stringify(chunk);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              
              // Accumulate final data for DB write
              if (chunk.type === 'done') {
                finalContent = chunk.content || '';
                finalThinking = chunk.thinking || '';
                finalTokens = chunk.tokensUsed || { input: 0, output: 0, thinking: 0 };
                finalToolCalls = chunk.toolCalls || [];
                finalWeatherData = chunk.weatherData || [];
                finalAirportData = chunk.airportData || [];
                finalModel = chunk.modelUsed || 'gemini-2.5-flash';
              }
            }
            
            // Save to database (only after streaming completes)
            const messagesToInsert = [
              {
                conversation_id: convId,
                role: 'user',
                content: message,
                tokens_used: null,
                weather_tool_data: null,
                airport_tool_data: null,
                thinking_content: null,
                thinking_tokens: 0
              },
              {
                conversation_id: convId,
                role: 'assistant',
                content: finalContent,
                tokens_used: finalTokens,
                weather_tool_data: finalWeatherData.length > 0 ? finalWeatherData : null,
                airport_tool_data: finalAirportData.length > 0 ? finalAirportData : null,
                thinking_content: finalThinking || null,
                thinking_tokens: finalTokens.thinking || 0
              }
            ];
            
            const { error: insertError } = (await (supabase
              .from('chat_messages') as any)
              .insert(messagesToInsert)) as { error: any };
            
            if (insertError) {
              console.error('Error saving streaming messages:', insertError);
            }
            
            // Log usage
            const costUsd = calculateGeneralChatCost(finalTokens.input, finalTokens.output);
            
            await (supabase
              .from('gemini_usage_logs') as any)
              .insert({
                conversation_id: convId,
                flight_id: null,
                input_tokens: finalTokens.input,
                output_tokens: finalTokens.output,
                cost_usd: costUsd,
                model: finalModel
              });
            
            // Update conversation timestamp
            await (supabase
              .from('chat_conversations') as any)
              .update({ updated_at: new Date().toISOString() })
              .eq('id', convId);
            
            // Send final metadata chunk
            const finalMeta = {
              type: 'complete',
              conversationId: convId,
              cost: costUsd
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalMeta)}\n\n`));
            
            // End stream
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            
          } catch (error) {
            console.error('Streaming error:', error);
            const errorData = {
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
            controller.close();
          }
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
    
    // NON-STREAMING MODE: Original logic
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
        airport_tool_data: null,
        thinking_content: null,
        thinking_tokens: 0
      },
      {
        conversation_id: convId,
        role: 'assistant',
        content: aiResponse,
        tokens_used: tokensUsed,
        weather_tool_data: weatherData ? weatherData : null,
        airport_tool_data: airportData ? airportData : null,
        thinking_content: null,
        thinking_tokens: tokensUsed.thinking || 0
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
