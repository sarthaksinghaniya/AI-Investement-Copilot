# AI Investment Copilot

A modern, production-level AI-powered stock analysis dashboard built with React, Vite, and Tailwind CSS.

## Features

- **Stock Analysis**: Real-time stock data with BUY/SELL/WATCH signals
- **Interactive Charts**: Price charts with technical indicators (EMA, SMA) and RSI analysis
- **AI Copilot**: Intelligent chat interface for stock insights and analysis
- **Probability Analysis**: Visual representation of signal probabilities
- **Market Alerts**: Real-time alerts for strong market signals (auto-refresh every 30s)
- **Responsive Design**: Modern fintech UI inspired by TradingView
- **Indian Stock Support**: Automatic symbol normalization for Indian stocks (.NS suffix)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **API**: FastAPI backend (running on http://127.0.0.1:8000)

## Project Structure

```
src/
 ├── components/
 │    ├── SearchBar.jsx          # Stock search functionality
 │    ├── StockCard.jsx          # Stock information display with signal icons
 │    ├── PriceChart.jsx         # Price and technical indicators chart
 │    ├── RSIChart.jsx           # RSI analysis chart
 │    ├── ProbabilityBar.jsx     # Signal probabilities visualization
 │    ├── CopilotChat.jsx        # AI chat interface with validation
 │    └── AlertsPanel.jsx        # Market alerts with auto-refresh
 │
 ├── pages/
 │    └── Dashboard.jsx           # Main dashboard layout
 │
 ├── services/
 │    └── api.js                 # API service layer with Indian stock support
 │
 ├── App.jsx                     # Root component
 ├── main.jsx                    # Application entry point
 └── index.css                   # Global styles with Tailwind

Backend/
 ├── main.py                    # FastAPI application
 ├── routes/                     # API endpoints
 ├── ml/                        # Machine learning models
 └── services/                   # Business logic
```

## Installation

1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Usage

1. **Search for stocks**: Use the search bar to look up any stock symbol
   - Indian stocks: TCS, INFY, RELIANCE (auto-adds .NS)
   - US stocks: AAPL, TSLA, GOOGL

2. **View analysis**: The dashboard displays:
   - Current price and signal with visual indicators
   - Technical analysis with price charts and indicators
   - RSI indicator with overbought/oversold zones
   - Signal probabilities with confidence levels

3. **AI Copilot**: Ask questions about the selected stock:
   - "What are the key technical indicators?"
   - "Should I buy this stock now?"
   - "What are the risk factors?"

4. **Market Alerts**: Monitor real-time alerts for strong BUY/SELL signals
   - Auto-refreshes every 30 seconds
   - Shows confidence percentages and pricing

## API Endpoints

### GET /stock/{symbol}
Returns comprehensive stock analysis:
```json
{
  "symbol": "AAPL",
  "price": 150.25,
  "signal": "BUY",
  "confidence": 0.85,
  "reason": "Strong bullish momentum detected",
  "top_factors": [
    {"factor": "RSI Oversold", "signal": "BUY"},
    {"factor": "EMA Crossover", "signal": "BUY"}
  ],
  "probabilities": {
    "BUY": 0.75,
    "SELL": 0.10,
    "WATCH": 0.15
  },
  "historical_data": [...],
  "indicators": {
    "RSI": [...],
    "EMA_10": [...],
    "EMA_20": [...],
    "SMA_50": [...]
  }
}
```

### POST /copilot/chat
AI chat interaction:
```json
{
  "query": "What are the key indicators for AAPL?",
  "stock": "AAPL"
}
```

### GET /alerts
Returns market alerts for strong signals with auto-refresh.

## Component Details

### SearchBar
- Real-time stock symbol search with validation
- Enter key support for quick searches
- Auto-formatting for stock symbols

### StockCard
- Enhanced display with signal icons (BUY/SELL/WATCH)
- Color-coded signal badges with confidence percentages
- Top contributing factors (limited to 3 for better UX)
- Conditional analysis section display

### PriceChart
- Interactive line chart with Recharts
- Multiple indicators: Close Price, EMA 10/20, SMA 50
- Custom tooltips and dark theme
- Conditional rendering based on data availability

### RSIChart
- RSI indicator visualization
- Reference lines for overbought (70) and oversold (30) levels
- Color-coded zones for easy interpretation

### ProbabilityBar
- Horizontal bar charts for signal probabilities
- Animated transitions with confidence indicators
- Dominant signal highlighting

### CopilotChat
- Enhanced AI chat interface with stock validation
- Message history with timestamps
- Typing indicators and error handling
- Prevents queries without selected stock

### AlertsPanel
- Real-time market alerts with 30-second auto-refresh
- Enhanced error handling and loading states
- Improved alert display with confidence percentages
- Graceful degradation for missing data

## Recent Improvements

### Enhanced UI/UX
- Added signal icons to StockCard for better visual feedback
- Improved analysis section with conditional rendering
- Better error handling in CopilotChat
- Enhanced alerts display with cleaner layout

### Better Data Handling
- Indian stock symbol normalization (auto .NS suffix)
- Improved API error handling with fallbacks
- Conditional chart rendering to prevent crashes
- Better loading states and error messages

### Performance & Reliability
- Auto-refresh alerts every 30 seconds
- Improved error logging and debugging
- Better null/undefined data handling
- Optimized component re-renders

## Styling

- **Dark theme**: Professional fintech appearance
- **Responsive design**: Works on desktop and mobile
- **Modern UI**: Rounded corners, shadows, and smooth transitions
- **Color coding**: Intuitive signal visualization
- **Loading states**: Smooth user experience during data fetching

## Error Handling

- Network error handling with user-friendly messages
- Empty state handling for no data scenarios
- Loading indicators for better UX
- Input validation and sanitization
- Graceful degradation for missing data

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern browsers with ES6+ support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

