
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { usePageContextStore } from './page-context-store';

// List of routes that should NOT trigger page context
const CONTEXT_EXCLUSION_LIST = [
  '/chat-enhanced',
  '/sidebar-header-test',
  '/ai-test-components',
  '/kokonutui-test',
  '/ui-lab',
  '/weathertest',
  '/airporttest',
  '/dashboard-test',
];

// Maps pathnames to user-friendly labels
const ROUTE_LABELS: { [key: string]: string } = {
  '/flights': 'Flights Dashboard',
  '/weather': 'Global Weather',
  '/airports': 'Airport Directory',
  '/settings': 'User Settings',
  '/': 'Dashboard',
};

const getElementText = (element: Element | null): string => {
  if (!element) return '';
  return (element as HTMLElement).innerText || '';
};

/**
 * A client hook that automatically detects the current page and its content,
 * updating the global page context store.
 */
export const usePageContext = () => {
  const pathname = usePathname();
  const { setContext, contextEnabled, isContextSetByUser } = usePageContextStore();
  const [pageContent, setPageContent] = useState('');

  useEffect(() => {
    const extractContent = () => {
      const mainContentElement = document.querySelector('main');
      const content = getElementText(mainContentElement);
      setPageContent(content);
    };

    extractContent();

    const observer = new MutationObserver(extractContent);
    const mainContentElement = document.querySelector('main');
    if (mainContentElement) {
      observer.observe(mainContentElement, { childList: true, subtree: true, characterData: true });
    }

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (contextEnabled && !isContextSetByUser) {
      const isExcluded = CONTEXT_EXCLUSION_LIST.some(route => pathname.startsWith(route));
      if (isExcluded) {
        return;
      }

      const label = ROUTE_LABELS[pathname] || document.title || 'Current Page';
      const summary = pageContent.substring(0, 1000); // Increased summary length

      setContext({
        type: 'page',
        path: pathname,
        label: label,
        content: summary,
      });
    }
  }, [pageContent, pathname, contextEnabled, isContextSetByUser, setContext]);
};