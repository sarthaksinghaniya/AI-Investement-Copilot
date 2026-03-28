import React from 'react';

const AIExplanationCard = ({ explanation }) => {
  if (!explanation) {
    return null;
  }

  // Highlight keywords in the explanation
  const highlightKeywords = (text) => {
    const keywords = ['BUY', 'SELL', 'WATCH', 'RSI', 'EMA', 'oversold', 'overbought', 'bullish', 'bearish', '%'];
    let highlightedText = text;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="text-yellow-300 font-semibold">$1</span>');
    });
    
    return highlightedText;
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-2">🤖</span>
        <h3 className="text-lg font-semibold text-white">AI Insight</h3>
      </div>
      
      {/* Explanation Body */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
        <div 
          className="text-gray-300 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ 
            __html: highlightKeywords(explanation) 
          }}
        />
      </div>
      
      {/* Key Points Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Signal Analysis */}
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Signal Analysis</p>
            <div className="space-y-1">
              {explanation.includes('BUY') && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">Bullish Signal Detected</span>
                </div>
              )}
              {explanation.includes('SELL') && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400 text-sm">Bearish Signal Detected</span>
                </div>
              )}
              {explanation.includes('WATCH') && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-400 text-sm">Neutral - Hold Position</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Confidence Meter */}
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">AI Confidence</p>
            <div className="space-y-2">
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    explanation.includes('High confidence') ? 'bg-green-400 w-4/5' :
                    explanation.includes('Strong confidence') ? 'bg-blue-400 w-3/5' :
                    explanation.includes('moderate') ? 'bg-yellow-400 w-2/5' :
                    'bg-gray-400 w-1/5'
                  }`}
                ></div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                {explanation.includes('High confidence') ? 'High Confidence' :
                 explanation.includes('Strong confidence') ? 'Strong Confidence' :
                 explanation.includes('moderate') ? 'Moderate Confidence' : 'Low Confidence'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Guidance */}
      <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-600">
        <p className="text-sm text-blue-300 mb-2">
          <span className="font-semibold">💡 Recommendation:</span>
          {explanation.includes('buying opportunity') && ' Consider entering a long position'}
          {explanation.includes('selling') && ' Consider reducing exposure or taking profits'}
          {explanation.includes('wait for clearer signals') && ' Hold current position and monitor for better entry points'}
          {!explanation.includes('buying opportunity') && !explanation.includes('selling') && !explanation.includes('wait for clearer signals') && ' Monitor market for clearer directional signals'}
        </p>
        <p className="text-xs text-blue-400">
          Always consider your risk tolerance and investment horizon
        </p>
      </div>
    </div>
  );
};

export default AIExplanationCard;
