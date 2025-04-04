
import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMetrics } from "@/contexts/MetricsContext";
import { formatDate } from "@/utils/workoutUtils";
import { ChevronDown, Scale, Dumbbell, Ruler, TrendingUp, ChevronRight, Minus, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

type MetricType = "weight" | "bodyFat" | "muscleMass";

const MetricsChart: React.FC = () => {
  const { metrics } = useMetrics();
  const { t } = useLanguage();
  const [activeMetric, setActiveMetric] = useState<MetricType>("weight");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getMetricEntries = (type: MetricType) => {
    return metrics[type].entries
      .filter(entry => !isNaN(entry.value))
      .map(entry => ({
        date: formatDate(entry.date),
        value: entry.value
      }));
  };

  const getChartTitle = () => {
    switch (activeMetric) {
      case "weight":
        return "Gewichtsentwicklung";
      case "bodyFat":
        return "Körperfettentwicklung";
      case "muscleMass":
        return "Muskelmasssentwicklung";
    }
  };

  const getChartIcon = () => {
    switch (activeMetric) {
      case "weight":
        return <TrendingUp size={18} className="text-accent" />;
      case "bodyFat":
        return <Ruler size={18} />;
      case "muscleMass":
        return <Dumbbell size={18} />;
    }
  };

  const getMetricColor = () => {
    switch (activeMetric) {
      case "weight":
        return "hsl(var(--accent))";
      case "bodyFat":
        return "hsl(var(--destructive))";
      case "muscleMass":
        return "hsl(120, 100%, 30%)"; // Green
    }
  };

  const getUnit = () => metrics[activeMetric].unit;

  const formatXAxis = (dateStr: string) => {
    const parts = dateStr.split(',')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}.`;
    }
    return dateStr;
  };

  const getYAxisDomain = () => {
    if (activeMetric === "weight") {
      return [0, 300] as [number, number]; // Max 300kg for weight, explicitly typed
    } else if (activeMetric === "bodyFat") {
      return [0, 50] as [number, number];
    } else {
      return [0, 90] as [number, number];
    }
  };

  const data = getMetricEntries(activeMetric);
  const goal = metrics[activeMetric].goal;

  const hasValidData = data.length > 0;

  return (
    <div className="glass-card rounded-xl p-6 w-full animate-slide-up mb-8">
      <Collapsible 
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-secondary/50 transition-colors"
                aria-label={isCollapsed ? "Expand chart" : "Collapse chart"}
              >
                {isCollapsed ? (
                  <Plus size={18} className="text-muted-foreground" />
                ) : (
                  <Minus size={18} className="text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            {getChartIcon()}
            <h3 className="text-lg font-semibold">{getChartTitle()}</h3>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <span>{activeMetric === "weight" ? "Gewicht" : activeMetric === "bodyFat" ? "Körperfett" : "Muskelmasse"}</span>
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-30 top-full right-0 mt-1 bg-background border border-border rounded-lg shadow-lg w-48">
                <ScrollArea className="max-h-48">
                  <button
                    onClick={() => {
                      setActiveMetric("weight");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors flex items-center gap-2 ${
                      activeMetric === "weight" ? "bg-secondary" : ""
                    }`}
                  >
                    <Scale size={16} />
                    <span>Gewicht</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMetric("bodyFat");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors flex items-center gap-2 ${
                      activeMetric === "bodyFat" ? "bg-secondary" : ""
                    }`}
                  >
                    <Ruler size={16} />
                    <span>Körperfett</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMetric("muscleMass");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors flex items-center gap-2 ${
                      activeMetric === "muscleMass" ? "bg-secondary" : ""
                    }`}
                  >
                    <Dumbbell size={16} />
                    <span>Muskelmasse</span>
                  </button>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        <CollapsibleContent className="h-[320px]">
          {hasValidData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={data} 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`color${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatXAxis}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={getYAxisDomain()}
                  tickFormatter={(value: number) => `${value}${getUnit()}`}
                />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                  formatter={(value: number) => {
                    if (isNaN(value)) return ["Ungültiger Wert", ""];
                    return [`${value} ${getUnit()}`, activeMetric === "weight" ? "Gewicht" : activeMetric === "bodyFat" ? "Körperfett" : "Muskelmasse"]; 
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={getMetricColor()}
                  fillOpacity={1}
                  fill={`url(#color${activeMetric})`}
                  strokeWidth={2}
                  name={activeMetric === "weight" ? "Gewicht" : activeMetric === "bodyFat" ? "Körperfett" : "Muskelmasse"}
                />
                
                {goal && goal.target && !isNaN(goal.target) && (
                  <ReferenceLine 
                    y={goal.target} 
                    stroke={getMetricColor()} 
                    strokeDasharray="3 3"
                    strokeWidth={2}
                    label={{
                      position: 'right',
                      value: `Ziel: ${goal.target}${getUnit()}`,
                      fill: getMetricColor(),
                      fontSize: 12
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Noch keine {activeMetric === "weight" ? "Gewichts" : activeMetric === "bodyFat" ? "Körperfett" : "Muskelmasse"}daten vorhanden.
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MetricsChart;
