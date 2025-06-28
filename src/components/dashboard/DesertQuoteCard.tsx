import React from 'react';
import { Quote } from 'lucide-react';
import { DesertQuote } from '../../types/dashboard';

interface DesertQuoteCardProps {
  quote: DesertQuote;
}

export const DesertQuoteCard: React.FC<DesertQuoteCardProps> = ({ quote }) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-xl"></div>
      
      <div className="relative bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-amber-500/40">
        <div className="text-center">
          <Quote className="w-8 h-8 text-amber-400 mx-auto mb-4" />
          
          <blockquote className="text-amber-100 text-lg italic leading-relaxed mb-4">
            "{quote.text}"
          </blockquote>
          
          {quote.author && (
            <cite className="text-amber-300/80 text-sm font-medium">
              — {quote.author}
            </cite>
          )}
        </div>
      </div>
    </div>
  );
};