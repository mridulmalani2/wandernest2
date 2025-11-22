import React from "react";

export const WanderNestLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Gradient definition */}
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1C2C8F" />
        <stop offset="50%" stopColor="#7B3FA8" />
        <stop offset="100%" stopColor="#E238B8" />
      </linearGradient>
    </defs>

    {/* Outer circle */}
    <circle
      cx="128"
      cy="128"
      r="110"
      fill="none"
      stroke="url(#logoGradient)"
      strokeWidth="6"
    />

    {/* Inner knot - interlocking ribbon loops */}
    {/* Top-left to bottom-right loop */}
    <path
      d="M 85 75 Q 70 90, 70 110 Q 70 130, 85 145 Q 100 160, 128 160 Q 156 160, 171 145 Q 186 130, 186 110 Q 186 90, 171 75"
      stroke="url(#logoGradient)"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Bottom-left to top-right loop */}
    <path
      d="M 85 181 Q 70 166, 70 146 Q 70 126, 85 111 Q 100 96, 128 96 Q 156 96, 171 111 Q 186 126, 186 146 Q 186 166, 171 181"
      stroke="url(#logoGradient)"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Left vertical loop */}
    <path
      d="M 75 85 Q 60 100, 60 128 Q 60 156, 75 171"
      stroke="url(#logoGradient)"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Right vertical loop */}
    <path
      d="M 181 85 Q 196 100, 196 128 Q 196 156, 181 171"
      stroke="url(#logoGradient)"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Center crossing ribbons */}
    <path
      d="M 95 128 Q 110 118, 128 118 Q 146 118, 161 128"
      stroke="url(#logoGradient)"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M 95 128 Q 110 138, 128 138 Q 146 138, 161 128"
      stroke="url(#logoGradient)"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
