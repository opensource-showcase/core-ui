import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  gfm: true,
  breaks: false,
});

/**
 * Safely parses markdown text into sanitized HTML for React's dangerouslySetInnerHTML.
 */
export const renderMarkdown = (text?: string): { __html: string } => {
  if (!text) return { __html: '' };
  try {
    const rawHtml = marked.parse(text) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return { __html: cleanHtml };
  } catch {
    return { __html: text };
  }
};
