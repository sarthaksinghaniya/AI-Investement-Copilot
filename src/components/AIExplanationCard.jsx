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
      highlightedText = highlightedText.replace(regex, '<span class="text-blue-600 font-semibold">$1</span>');
    });
    
    return highlightedText;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-2xl">🤖</span>
        <h3 className="text-lg font-medium text-gray-800">AI Insight</h3>
      </div>
      
      {/* Explanation Body */}
      <div className="mb-6 rounded-xl bg-gray-50 p-6 transition-all duration-200 ease-out">
        <div 
          className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base"
          dangerouslySetInnerHTML={{ 
            __html: highlightKeywords(explanation) 
          }}
        />
      </div>
      
      {/* Key Points Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Signal Analysis */}
        <div className="rounded-xl bg-gray-50 p-4 transition-all duration-200 ease-out">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-3">Signal Analysis</p>
          <div className="space-y-2">
            {explanation.includes('BUY') && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
                <span className="font-semibold text-green-600">Bullish Signal Detected</span>
              </div>
            )}
            {explanation.includes('SELL') && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-red-500 font-semibold">Bearish Signal Detected</span>
              </div>
            )}
            {explanation.includes('WATCH') && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                <span className="text-gray-500 font-semibold">Neutral - Hold Position</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Confidence Meter */}
        <div className="rounded-xl bg-gray-50 p-4 transition-all duration-200 ease-out">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-3">AI Confidence</p>
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-200 ${
                  explanation.includes('High confidence') ? 'bg-green-600 w-4/5' :
                  explanation.includes('Strong confidence') ? 'bg-blue-500 w-3/5' :
                  explanation.includes('moderate') ? 'bg-blue-400 w-2/5' :
                  'bg-gray-400 w-1/5'
                }`}
              ></div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              {explanation.includes('High confidence') ? 'High Confidence' :
               explanation.includes('Strong confidence') ? 'Strong Confidence' :
               explanation.includes('moderate') ? 'Moderate Confidence' : 'Low Confidence'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Action Guidance */}
      <div className="p-4 bg-blue-50 rounded-xl">
        <p className="text-base text-blue-700 mb-2">
          <span className="font-semibold">💡 Recommendation:</span>
          {explanation.includes('buying opportunity') && ' Consider entering a long position'}
          {explanation.includes('selling') && ' Consider reducing exposure or taking profits'}
          {explanation.includes('wait for clearer signals') && ' Hold current position and monitor for better entry points'}
          {!explanation.includes('buying opportunity') && !explanation.includes('selling') && !explanation.includes('wait for clearer signals') && ' Monitor market for clearer directional signals'}
        </p>
        <p className="text-sm text-blue-600">
          Always consider your risk tolerance and investment horizon
        </p>
      </div>
    </div>
  );
};

export default AIExplanationCard;
