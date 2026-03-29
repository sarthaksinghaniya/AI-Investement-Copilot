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
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-2">🤖</span>
        <h3 className="text-2xl font-bold text-gray-900">AI Insight</h3>
      </div>
      
      {/* Explanation Body */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 transition-all duration-300 ease-out">
        <div 
          className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base"
          dangerouslySetInnerHTML={{ 
            __html: highlightKeywords(explanation) 
          }}
        />
      </div>
      
      {/* Key Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Signal Analysis */}
        <div className="bg-gray-50 rounded-xl p-4 transition-all duration-300 ease-out">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-3">Signal Analysis</p>
          <div className="space-y-2">
            {explanation.includes('BUY') && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-500 font-semibold">Bullish Signal Detected</span>
              </div>
            )}
            {explanation.includes('SELL') && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-500 font-semibold">Bearish Signal Detected</span>
              </div>
            )}
            {explanation.includes('WATCH') && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-500 font-semibold">Neutral - Hold Position</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Confidence Meter */}
        <div className="bg-gray-50 rounded-xl p-4 transition-all duration-300 ease-out">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-3">AI Confidence</p>
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  explanation.includes('High confidence') ? 'bg-green-500 w-4/5' :
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
          <span className="font-bold">💡 Recommendation:</span>
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
