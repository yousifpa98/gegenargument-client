// lib/useHead.js
import { useEffect } from 'react';

export function useHead({ title, meta = [], link = [] }) {
  useEffect(() => {
    if (title) document.title = title;

    // Clean old meta/link tags we created
    const oldMeta = document.querySelectorAll('[data-head-dynamic]');
    oldMeta.forEach((el) => el.remove());

    // Inject meta tags
    meta.forEach((metaTag) => {
      const tag = document.createElement('meta');
      Object.entries(metaTag).forEach(([key, val]) => tag.setAttribute(key, val));
      tag.setAttribute('data-head-dynamic', 'true');
      document.head.appendChild(tag);
    });

    // Inject link tags (like canonical)
    link.forEach((linkTag) => {
      const tag = document.createElement('link');
      Object.entries(linkTag).forEach(([key, val]) => tag.setAttribute(key, val));
      tag.setAttribute('data-head-dynamic', 'true');
      document.head.appendChild(tag);
    });
  }, [title, JSON.stringify(meta), JSON.stringify(link)]);
}
