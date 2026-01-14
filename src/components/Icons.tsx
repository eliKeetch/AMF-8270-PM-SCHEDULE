import React from 'react';

export const BowlingPin = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Simplified Pin Outline */}
    <path d="M12 2c-1 0-1.5.5-1.5 1.5 0 .8.2 1.5.5 2.5l-.5 4c-1.5 1-2.5 3-2.5 5 0 3 1.5 6 4 6s4-3 4-6c0-2-1-4-2.5-5l-.5-4c.3-1 .5-1.7.5-2.5 0-1-.5-1.5-1.5-1.5z" />
    {/* Single Stripe at Neck Area */}
    <path d="M10.5 7h3" />
  </svg>
);
