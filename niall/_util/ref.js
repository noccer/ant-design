import React from 'react';
export function fillRef(ref, node) {
  if (typeof ref === 'function') {
    ref(node);
  } else if (typeof ref === 'object' && ref && 'current' in ref) {
    ref.current = node;
  }
}
export function composeRef(...refs) {
  return node => {
    refs.forEach(ref => {
      fillRef(ref, node);
    });
  };
}
