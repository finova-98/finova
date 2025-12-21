
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Search, Plus } from "lucide-react";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data generator (Fallback)
const generateMockChartData = (baseValue: number, points: number) => {
    const data = [];
    let currentValue = baseValue;
    for (let i = 0; i < points; i++) {
        const change = (Math.random() - 0.5) * 5;
        currentValue += change;
        data.push({
            time: new Date(Date.now() - (points - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: Number(currentValue.toFixed(2))
        });
    }
    return data;
};

const initialStocks = [
    { symbol: "RELIANCE.BSE", name: "Reliance Industries", price: 2450.50, change: 15.25, isPositive: true },
    { symbol: "TCS.BSE", name: "Tata Consultancy Svcs", price: 3890.80, change: -12.45, isPositive: false },
    { symbol: "HDFCBANK.BSE", name: "HDFC Bank", price: 1640.85, change: 22.10, isPositive: true },
    { symbol: "INFY.BSE", name: "Infosys Ltd", price: 1560.20, change: -8.50, isPositive: false },
    { symbol: "ICICIBANK.BSE", name: "ICICI Bank", price: 1020.40, change: 10.85, isPositive: true },
];

export default function Market() {
    const [selectedStock, setSelectedStock] = useState(initialStocks[0]);
    const [stocks, setStocks] = useState(initialStocks);
    const [chartData, setChartData] = useState<any[]>(generateMockChartData(initialStocks[0].price, 20));

    // API State
    const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "";
    const isLive = !!apiKey;
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Handle Search
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResults([]);

        if (isLive) {
            try {
                // Alpha Vantage search endpoint
                const response = await axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=${apiKey}`);
                if (response.data && response.data.bestMatches) {
                    const matches = response.data.bestMatches.slice(0, 5).map((match: any) => ({
                        description: match['2. name'],
                        symbol: match['1. symbol'],
                        type: match['3. type']
                    }));
                    setSearchResults(matches);
                }
            } catch (error) {
                // Silently handle search errors
            } finally {
                setIsSearching(false);
            }
        } else {
            // Mock Search Simulation
            setTimeout(() => {
                const mockResult = {
                    description: searchQuery.toUpperCase() + " INDIA LTD",
                    symbol: searchQuery.toUpperCase() + ".NS",
                    type: "Equity"
                };
                setSearchResults([mockResult]);
                setIsSearching(false);
            }, 500);
        }
    };

    const addStockToWatchlist = async (symbol: string, description: string) => {
        // Check if already in list
        const existing = stocks.find(s => s.symbol === symbol);
        if (existing) {
            setSelectedStock(existing);
            setSearchResults([]);
            setSearchQuery("");
            return;
        }

        // New stock structure
        const newStock = {
            symbol: symbol,
            name: description,
            price: 0,
            change: 0,
            isPositive: true
        };

        // If live, fetch real data immediately
        if (isLive) {
            const data = await fetchQuote(symbol, apiKey);
            if (data) {
                newStock.price = data.price;
                newStock.change = data.change;
                newStock.isPositive = data.isPositive;
            }
        } else {
            // Mock data for added stock
            newStock.price = Math.random() * 2000 + 100;
            newStock.change = (Math.random() - 0.5) * 5;
            newStock.isPositive = newStock.change >= 0;
        }

        setStocks([newStock, ...stocks]);
        setSelectedStock(newStock);
        setSearchResults([]);
        setSearchQuery("");
    };

    // Fetch Stock Quote
    const fetchQuote = async (symbol: string, key: string) => {
        try {
            const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`);
            const quote = response.data['Global Quote'];
            
            if (quote && quote['05. price']) {
                const currentPrice = parseFloat(quote['05. price']);
                const prevClose = parseFloat(quote['08. previous close']);
                const change = ((currentPrice - prevClose) / prevClose) * 100;

                if (apiError) setApiError(null);

                return {
                    price: currentPrice,
                    change: change,
                    isPositive: change >= 0
                };
            }
            return null;
        } catch (error: any) {
            // Silently handle API errors to avoid console spam
            if (error.response?.status === 401 || error.response?.status === 403) {
                setApiError("Invalid Alpha Vantage API Key. Please check your configuration.");
            } else if (error.message?.includes('rate limit')) {
                setApiError("API Rate Limit Exceeded (25 requests/day on free tier).");
            }
            return null;
        }
    };

    // Fetch all stock data
    const fetchAllData = async (key: string) => {
        if (!key) return;
        setIsLoading(true);
        setApiError(null);

        try {
            const updatedStocks = await Promise.all(
                stocks.map(async (stock) => {
                    const data = await fetchQuote(stock.symbol, key);
                    if (data) {
                        return { ...stock, ...data };
                    }
                    return stock;
                })
            );
            setStocks(updatedStocks);
            const currentSelected = updatedStocks.find(s => s.symbol === selectedStock.symbol);
            if (currentSelected) setSelectedStock(currentSelected);

        } catch (error) {
            console.error("Failed to fetch live data:", error);
            setApiError("Unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch Candles
    const fetchChart = async (symbol: string, key: string) => {
        if (!key) return;

        try {
            const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
            const timeSeries = response.data['Time Series (Daily)'];
            
            if (timeSeries) {
                const dates = Object.keys(timeSeries).slice(0, 30).reverse();
                const formattedData = dates.map(date => ({
                    time: new Date(date).toLocaleDateString(),
                    value: parseFloat(timeSeries[date]['4. close'])
                }));
                setChartData(formattedData);
            }
        } catch (error: any) {
            // Silently handle chart fetch errors (likely API key issues)
            // Chart will remain empty or show previous data
        }
    };

    // Simulation Effect
    useEffect(() => {
        if (isLive && !apiError) return;

        const interval = setInterval(() => {
            setStocks(currentStocks =>
                currentStocks.map(stock => {
                    const fluctuation = (Math.random() - 0.5) * 0.5;
                    const newPrice = Math.max(0, stock.price + fluctuation);
                    const newChange = stock.change + fluctuation;
                    return {
                        ...stock,
                        price: Number(newPrice.toFixed(2)),
                        change: Number(newChange.toFixed(2)),
                        isPositive: newChange >= 0
                    };
                })
            );

            setChartData(currentData => {
                const lastValue = currentData[currentData.length - 1].value;
                const newValue = Number((lastValue + (Math.random() - 0.5) * 2).toFixed(2));
                const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return [...currentData.slice(1), { time: newTime, value: newValue }];
            });

        }, 3000);

        return () => clearInterval(interval);
    }, [isLive, apiError]);

    // Initial Live Fetch
    useEffect(() => {
        if (isLive && apiKey) {
            fetchAllData(apiKey);
        }
    }, [apiKey, isLive]);

    // Chart Effect
    useEffect(() => {
        if (isLive && apiKey && !apiError) {
            fetchChart(selectedStock.symbol, apiKey);
        } else {
            setChartData(generateMockChartData(selectedStock.price, 20));
        }
    }, [selectedStock, isLive, apiKey, apiError]);

    return (
        <AppLayout title="Market">
            <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto pb-24">

                {apiError && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>API Error</AlertTitle>
                        <AlertDescription>
                            {apiError} Falling back to simulated data.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search Bar */}
                <Card className="relative overflow-visible z-20">
                    <CardContent className="p-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Search symbol or company (e.g. TATAMOTORS)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={isSearching}>
                                {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </form>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 animate-fade-in-up">
                                <div className="p-2 space-y-1">
                                    {searchResults.map((result, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => addStockToWatchlist(result.symbol, result.description)}
                                            className="w-full text-left px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm flex items-center justify-between group"
                                        >
                                            <div>
                                                <div className="font-semibold">{result.symbol}</div>
                                                <div className="text-xs text-muted-foreground">{result.description}</div>
                                            </div>
                                            <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Main Chart Card */}
                <Card className="animate-fade-in-up">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl font-bold">{selectedStock.symbol}</CardTitle>
                                <CardDescription>{selectedStock.name}</CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">
                                    ₹{selectedStock.price ? selectedStock.price.toFixed(2) : "0.00"}
                                </div>
                                <div className={`flex items-center justify-end text-sm ${selectedStock.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {selectedStock.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                    {selectedStock.change > 0 ? '+' : ''}{selectedStock.change ? selectedStock.change.toFixed(2) : "0.00"}%
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={selectedStock.isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={selectedStock.isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            color: '#000'
                                        }}
                                        labelStyle={{ color: '#666' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={selectedStock.isPositive ? "#10b981" : "#ef4444"}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        strokeWidth={2}
                                        isAnimationActive={true}
                                    />
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={['auto', 'auto']} hide />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        {isLive && !apiError && (
                            <div className="flex justify-end mt-2">
                                <Button variant="ghost" size="sm" onClick={() => fetchAllData(apiKey)} disabled={isLoading}>
                                    <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                                </Button>
                            </div>
                        )}
                        {apiError && (
                            <div className="flex justify-end mt-2">
                                <Button variant="ghost" size="sm" onClick={() => fetchAllData(apiKey)} disabled={isLoading}>
                                    <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Retry Connection
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stock List */}
                <h3 className="text-lg font-semibold mt-6 mb-4">Watchlist</h3>
                <div className="grid gap-4">
                    {stocks.map((stock) => (
                        <Card
                            key={stock.symbol}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedStock.symbol === stock.symbol ? 'border-primary ring-1 ring-primary/20' : ''}`}
                            onClick={() => {
                                setSelectedStock(stock);
                            }}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${stock.isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {stock.isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{stock.symbol}</h4>
                                        <p className="text-xs text-muted-foreground">{stock.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">
                                        ₹{stock.price ? stock.price.toFixed(2) : "--"}
                                    </div>
                                    <div className={`text-xs ${stock.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                                        {stock.change > 0 ? '+' : ''}{stock.change ? stock.change.toFixed(2) : "--"}%
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
