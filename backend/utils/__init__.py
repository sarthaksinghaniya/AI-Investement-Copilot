# Utils module

# Known Indian stock symbols that need .NS suffix
INDIAN_STOCKS = {
    'TCS', 'INFY', 'RELIANCE', 'HDFCBANK', 'ICICI', 'HDFC', 'ITC', 'LT', 'BAJAJ',
    'MARUTI', 'AXISBANK', 'KOTAKBANK', 'BHARTIARTL', 'WIPRO', 'HINDUNILVR',
    'NESTLEIND', 'ULTRACEMCO', 'POWERGRID', 'NTPC', 'ONGC', 'COALINDIA', 'GAIL'
}

def normalize_stock_symbol(symbol: str) -> str:
    """
    Normalize stock symbol for Indian stocks.
    - Convert to uppercase
    - Add .NS suffix for known Indian stocks if not already present
    - Leave other symbols (US, international) as-is
    """
    if not symbol:
        return symbol

    symbol = symbol.upper().strip()

    # If symbol already has a suffix, return as-is
    if '.' in symbol:
        return symbol

    # Add .NS suffix for known Indian stocks
    base_symbol = symbol.split('.')[0]  # Remove any existing suffix
    if base_symbol in INDIAN_STOCKS:
        return f"{base_symbol}.NS"

    # For other symbols (US, international), return as-is
    return symbol
