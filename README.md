# AI Investment Copilot

A modern, production-level AI-powered stock analysis dashboard built with React, Vite, and Tailwind CSS.

## Features

- **Stock Analysis**: Real-time stock data with BUY/SELL/WATCH signals
- **Interactive Charts**: Price charts with technical indicators (EMA, SMA) and RSI analysis
- **AI Copilot**: Intelligent chat interface for stock insights and analysis
- **Probability Analysis**: Visual representation of signal probabilities
- **Market Alerts**: Real-time alerts for strong market signals (auto-refresh every 30s)
- **Portfolio Simulation**: Advanced backtesting with profit/loss calculations and win rate tracking
- **AI Explanation System**: Human-readable explanations for trading decisions with technical indicator context
- **Decision Summary Card**: Hero section with clear signal display and expected returns
- **Responsive Design**: Modern fintech UI inspired by TradingView with clean 2-column layout
- **Indian Stock Support**: Automatic symbol normalization for Indian stocks (.NS suffix)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **API**: FastAPI backend (running on http://127.0.0.1:8000)
- **ML**: TensorFlow LSTM model for price predictions

## Project Structure

```
src/
 ├── components/
 │    ├── SearchBar.jsx          # Stock search functionality
 │    ├── StockCard.jsx          # Stock information display with signal icons
 │    ├── PriceChart.jsx         # Price and technical indicators chart with trade markers
 │    ├── RSIChart.jsx           # RSI analysis chart
 │    ├── ProbabilityBar.jsx     # Signal probabilities visualization
 │    ├── DecisionSummaryCard.jsx # Hero decision card with signal display
 │    ├── BacktestResults.jsx    # Portfolio simulation results
 │    ├── AIExplanationCard.jsx  # AI-generated trading explanations
 │    ├── CopilotChat.jsx        # AI chat interface with validation
 │    └── AlertsPanel.jsx        # Market alerts with auto-refresh
 │
 ├── pages/
 │    └── Dashboard.jsx           # Main dashboard layout with 2-column design
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
 ├── ml/                        # Machine learning models and prediction logic
 └── services/                   # Business logic
```

## Installation

1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Usage

1. **Search for stocks**: Use search bar to look up any stock symbol
   - Indian stocks: TCS, INFY, RELIANCE (auto-adds .NS)
   - US stocks: AAPL, TSLA, GOOGL

2. **View analysis**: The dashboard displays:
   - **Decision Summary**: Hero card with signal, expected return, confidence, and backtest results
   - **Price Chart**: Interactive chart with predictions, technical indicators, and trade markers
   - **AI Explanation**: Human-readable insights with RSI/EMA context
   - **Portfolio Simulation**: Backtest results with profit/loss and win rate
   - **Technical Analysis**: RSI indicator with overbought/oversold zones
   - **Signal Probabilities**: Visual confidence levels for BUY/SELL/WATCH

3. **AI Copilot**: Ask questions about selected stock:
   - "What are the key technical indicators?"
   - "Should I buy this stock now?"
   - "What are the risk factors?"
   - Get human-readable explanations for trading decisions

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
  "prediction": {
    "prediction_signal": "BUY",
    "prediction_confidence": 0.85,
    "expected_return_pct": 3.2,
    "trend": "UP",
    "future_predictions": [...],
    "entry_points": [...],
    "exit_points": [...]
  },
  "backtest": {
    "final_value": 103200,
    "return_pct": 3.2,
    "win_rate": 75,
    "total_trades": 12,
    "trades": [...]
  },
  "ai_explanation": "The model predicts an upward price movement with an expected return of +3.2%...",
  "probabilities": {
    "BUY": 0.75,
    "SELL": 0.10,
    "WATCH": 0.15
  },
  ...
}
```

### POST /copilot/chat
AI chat interaction:
```json
{
  "query": "What are key indicators for AAPL?",
  "stock": "AAPL"
}
```

### GET /alerts
Returns market alerts for strong signals with auto-refresh.

## Component Details

### DecisionSummaryCard
- **Hero Section**: Large signal display (text-5xl) with expected returns
- **Confidence Meter**: Visual confidence representation
- **Backtest Summary**: Quick view of portfolio simulation results
- **Action Guidance**: Clear CTA buttons based on signal type
- **Premium Design**: Hover effects and smooth transitions

### AIExplanationCard
- **Human-Readable Insights**: Clear explanations of trading decisions
- **Technical Context**: RSI and EMA analysis integration
- **Keyword Highlighting**: Important terms emphasized
- **Signal Analysis**: Visual indicators for BUY/SELL/WATCH
- **Confidence Visualization**: Progress bars with color coding

### BacktestResults
- **Portfolio Simulation**: ₹100,000 starting capital simulation
- **Profit/Loss Tracking**: Detailed performance metrics
- **Win Rate Display**: Success percentage of trades
- **Recent Trades**: Last 5 trades with step-by-step details
- **Trade Markers**: Visual BUY/SELL indicators on charts

### PriceChart
- **Enhanced Visualization**: Trade markers on prediction line
- **Technical Indicators**: EMA, SMA, RSI integration
- **Future Predictions**: 15-step price forecasting
- **Confidence Bands**: Upper/lower bound visualization
- **Interactive Tooltips**: Detailed price and trade information

### SearchBar
- Real-time stock symbol search with validation
- Enter key support for quick searches
- Auto-formatting for stock symbols

### StockCard
- Enhanced display with signal icons (BUY/SELL/WATCH)
- Color-coded signal badges with confidence percentages
- Top contributing factors (limited to 3 for better UX)
- Conditional analysis section display

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

### Major Features Added
- **AI Explanation System**: Human-readable trading insights with technical indicator context
- **Portfolio Simulation**: Advanced backtesting with profit/loss calculations and win rate tracking
- **Decision Summary Card**: Hero section with clear signal display and expected returns
- **Trade Markers**: Visual BUY/SELL indicators on price charts
- **Signal Generation**: Automatic BUY/SELL/WATCH signals from future predictions

### UI/UX Redesign
- **Premium 2-Column Layout**: 70/30 split with clean hierarchy
- **Fintech-Grade Design**: Professional slate theme with consistent styling
- **Enhanced Typography**: Clear visual hierarchy with proper spacing
- **Smooth Transitions**: Hover effects and micro-interactions
- **Responsive Design**: Optimized for all screen sizes

### Enhanced Data Visualization
- **Interactive Charts**: Trade markers and confidence bands
- **Technical Indicators**: EMA, SMA, RSI integration
- **Backtest Visualization**: Detailed trade history and performance metrics
- **Signal Analysis**: Color-coded BUY/SELL/WATCH indicators

### Backend Enhancements
- **Prediction Signals**: Automatic signal generation from LSTM predictions
- **Confidence Calculations**: Quantified confidence scores
- **Entry/Exit Points**: Optimized trade timing detection
- **Portfolio Simulation**: Realistic backtesting with position sizing

### Technical Improvements
- **Error Handling**: Better fallbacks and graceful degradation
- **Performance**: Optimized rendering and data processing
- **Code Quality**: Cleaner component structure and better practices
- **Type Safety**: Improved data validation and error prevention

## Styling

- **Premium Theme**: Clean fintech appearance with slate color palette
- **2-Column Layout**: Optimized information hierarchy
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Rounded corners, shadows, and smooth transitions
- **Color Coding**: Intuitive signal visualization (green/red/yellow)
- **Loading States**: Smooth user experience during data fetching
- **Hover Effects**: Interactive elements with scale transitions

## Error Handling

- Network error handling with user-friendly messages
- Empty state handling for no data scenarios
- Loading indicators for better UX
- Input validation and sanitization
- Graceful degradation for missing data
- JSX syntax error prevention and proper component structure

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

