// lib/parseHead.jsx
import { Children, isValidElement } from 'react';

export function extractHeadData(HeadComponent) {
  const head = HeadComponent?.();
  const title = [];
  const meta = [];
  const link = [];

  Children.forEach(head?.props?.children, (child) => {
    if (!isValidElement(child)) return;
    const { type, props } = child;

    if (type === 'title') {
      title.push(props.children);
    }

    if (type === 'meta') {
      meta.push(props);
    }

    if (type === 'link') {
      link.push(props);
    }
  });

  return {
    title: title[0] || '',
    meta,
    link,
  };
}
