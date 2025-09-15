'use client'
import React from 'react';

const SocialButton = ({ icon, url, hoverColor }: { icon: React.ReactNode, url: string, hoverColor: string }) => (
  <button
    onClick={() => window.open(url, '_blank')}
    className={`text-[#F5F5F5] hover:${hoverColor} transition-colors`}
  >
    {icon}
  </button>
);

export default SocialButton