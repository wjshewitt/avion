/**
 * Page Context Detection Hook
 * Automatically detects the current page and extracts relevant context
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { usePageContextStore, type PageContext } from './page-context-store';

export function usePageContext() {
  const pathname = usePathname();
  const params = useParams();
  const { setContext, context, contextEnabled } = usePageContextStore();

  useEffect(() => {
    if (!pathname) return;

    let newContext: PageContext = { type: 'general' };

    // Weather pages
    if (pathname.startsWith('/weather/')) {
      if (pathname.includes('/briefing/')) {
        // Professional briefing page: /weather/briefing/[icao]
        const icao = (params?.icao as string)?.toUpperCase();
        if (icao) {
          newContext = {
            type: 'briefing',
            icao,
            title: `Professional Briefing for ${icao}`,
          };
        }
      } else if (params?.icao) {
        // Individual weather page: /weather/[icao]
        const icao = (params.icao as string).toUpperCase();
        newContext = {
          type: 'weather',
          icao,
          title: `Weather for ${icao}`,
        };
      } else if (pathname === '/weather') {
        // General weather page - no specific context
        newContext = { type: 'general' };
      }
    }
    // Airport pages
    else if (pathname.startsWith('/airports')) {
      // Check if we have a selected airport (could be in URL params or query)
      // For now, airports page doesn't have individual airport routes in the URL
      // but we could detect this from the search params later
      newContext = { type: 'general' };
    }
    // Flight pages (if they exist)
    else if (pathname.startsWith('/flights/')) {
      const flightId = params?.id as string;
      if (flightId) {
        newContext = {
          type: 'flight',
          flightId,
        };
      }
    }
    // Chat enhanced page - never show context badge here
    else if (pathname === '/chat-enhanced') {
      newContext = { type: 'general' };
    }
    // All other pages
    else {
      newContext = { type: 'general' };
    }

    // Only update if context actually changed
    if (JSON.stringify(context) !== JSON.stringify(newContext)) {
      setContext(newContext);
    }
  }, [pathname, params, setContext, context]);

  return {
    context,
    contextEnabled,
    hasContext: context.type !== 'general',
  };
}
