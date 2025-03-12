"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

interface HistoricalDataItem {
  Date: string;
  Price: number;
  Volume?: number;
  Change?: number;
}

interface ForecastData {
  dates: string[];
  values: number[];
  confidenceInterval?: [number, number][];
}

interface ModelMetrics {
  RMSE: number;
  MAE: number;
  MAPE: number;
  R2: number;
  executionTime: number;
}

interface MetricsData {
  ARIMA: ModelMetrics;
  LSTM: ModelMetrics;
  GARCH?: ModelMetrics;
  VAR?: ModelMetrics;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Brent Oil Price Analysis',
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 15,
        minRotation: 15,
      },
    },
    y: {
      title: {
        display: true,
        text: 'Price (USD)',
      },
    },
  },
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
};

const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-primary text-primary-foreground px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Brent Crude Oil Analytics Suite</h1>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <Badge variant="secondary" className="text-sm">
            Live Data
          </Badge>
          <span className="text-sm opacity-90">{currentTime}</span>
        </div>
      </div>
    </header>
  );
};

const HistoricalChart: React.FC<{ historicalData: HistoricalDataItem[] }> = ({ historicalData }) => {
  const data = {
    labels: historicalData.map(item => new Date(item.Date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Price',
        data: historicalData.map(item => item.Price),
        borderColor: 'hsl(221.2 83.2% 53.3%)',
        backgroundColor: 'hsl(221.2 83.2% 53.3% / 0.2)',
        fill: true,
        tension: 0.3,
      },
      {
        label: '30-day MA',
        data: historicalData.map((_, i, arr) => {
          if (i < 29) return null;
          return arr.slice(i - 29, i + 1).reduce((sum, item) => sum + item.Price, 0) / 30;
        }),
        borderColor: 'hsl(24.6 95% 53.1%)',
        borderDash: [5, 5],
        tension: 0.3,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Price Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <Line data={data} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
};

const ForecastInterface = ({ onForecast }: { onForecast: (steps: number, model: string) => Promise<void> }) => {
  const [steps, setSteps] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("ARIMA");

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onForecast(steps, selectedModel);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Forecast Horizon (days)</label>
            <Input
              type="number"
              value={steps}
              onChange={e => setSteps(Math.max(1, Number(e.target.value) || 1))}
              min="1"
              max="90"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Model Selection</label>
            <Tabs defaultValue="ARIMA" value={selectedModel} onValueChange={setSelectedModel}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="ARIMA">ARIMA</TabsTrigger>
                <TabsTrigger value="LSTM">LSTM</TabsTrigger>
                <TabsTrigger value="GARCH">GARCH</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <Button 
          onClick={handleSubmit} 
          className="w-full md:w-auto"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Run Forecast'}
        </Button>
      </CardContent>
    </Card>
  );
};

const ModelMetrics = ({ metrics }: { metrics?: MetricsData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Model Performance Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      {metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([model, values]) => (
            <div key={model} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <h3 className="font-semibold mb-2">{model}</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RMSE</span>
                  <span className="font-medium">{values.RMSE?.toFixed(2) || '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MAE</span>
                  <span className="font-medium">{values.MAE?.toFixed(2) || '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">R²</span>
                  <span className="font-medium">{values.R2?.toFixed(3) || '--'}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Execution: {values.executionTime || '--'}ms
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [historicalData, setHistoricalData] = useState<HistoricalDataItem[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData>();
  const [metrics, setMetrics] = useState<MetricsData>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [historyRes, metricsRes] = await Promise.all([
          axios.get<HistoricalDataItem[]>('http://localhost:5000/api/historical'),
          axios.get<MetricsData>('http://localhost:5000/api/metrics'),
        ]);
        setHistoricalData(historyRes.data);
        setMetrics(metricsRes.data);
      } catch (err) {
        setError('Failed to load initial data. Please try again later.');
      }
    };

    fetchInitialData();
  }, []);

  const handleForecast = async (steps: number, model: string) => {
    try {
      let response;
      switch(model) {
        case "ARIMA":
          response = await axios.post<ForecastData>('http://localhost:5000/api/predict/arima', { steps });
          setForecastData(response.data);
          break;
        case "LSTM":
          response = await axios.post<ForecastData>('http://localhost:5000/api/predict/lstm', { steps });
          setForecastData(response.data);
          break;
        default:
          setError('Selected model is not available');
          return;
      }
    } catch (err) {
      setError('Forecast failed. Please check your parameters.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Current Price</h3>
                <div className="text-2xl font-bold">
                  {historicalData[historicalData.length - 1]?.Price?.toFixed(2) || '--'} USD
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">24h Change</h3>
                <div className={`text-2xl font-bold ${
                  (historicalData[historicalData.length - 1]?.Change || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {historicalData[historicalData.length - 1]?.Change?.toFixed(2) || '--'}%
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Daily Volume</h3>
                <div className="text-2xl font-bold">
                  {historicalData[historicalData.length - 1]?.Volume?.toLocaleString() || '--'} bbl
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HistoricalChart historicalData={historicalData} />
          
          <Card>
            <CardHeader>
              <CardTitle>Price Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
            
                  <Line
                    data={{
                      labels: forecastData?.dates || [],
                      datasets: [
                        {
                          label: 'Forecasted Price',
                          data: forecastData?.values || [],
                          borderColor: 'hsl(142.1 76.2% 36.3%)',
                          backgroundColor: 'hsl(142.1 76.2% 36.3% / 0.1)',
                          fill: true,
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                
              </div>
            </CardContent>
          </Card>
        </div>

        <ForecastInterface onForecast={handleForecast} />
        <ModelMetrics metrics={metrics} />

       
      </main>
    </div>
  );
}