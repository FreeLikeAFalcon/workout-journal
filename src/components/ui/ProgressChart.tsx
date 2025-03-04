
import React, { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartData } from "@/modules/database/workouts/types";
import { formatDate, lbsToKg } from "@/utils/workoutUtils";
import { LineChart, TrendingUp, Minus, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import ExerciseSelector from "./ExerciseSelector";

interface ProgressChartProps {
  chartData: ChartData;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ chartData }) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();

  // Get list of available exercises
  const exercises = Object.keys(chartData);

  // If no exercise is selected yet and we have exercises, select the first one
  useEffect(() => {
    if (!selectedExercise && exercises.length > 0) {
      setSelectedExercise(exercises[0]);
    }
  }, [chartData, exercises, selectedExercise]);

  // Prepare data for the selected exercise
  const data = selectedExercise
    ? chartData[selectedExercise]?.map((item) => ({
        date: formatDate(item.date),
        maxWeight: lbsToKg(item.maxWeight),
        volumeLoad: lbsToKg(item.volumeLoad),
      }))
    : [];

  const formatXAxis = (dateStr: string) => {
    // Extract just the day and month from the date string
    const parts = dateStr.split(',')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}.`;
    }
    return dateStr;
  };

  return (
    <div className="glass-card rounded-xl p-6 w-full animate-slide-up">
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
                aria-label={isCollapsed ? t('expandChart') : t('collapseChart')}
              >
                {isCollapsed ? (
                  <Plus size={18} className="text-muted-foreground" />
                ) : (
                  <Minus size={18} className="text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <TrendingUp size={20} className="text-accent" />
            <h3 className="text-lg font-semibold">{t('progressTracking')}</h3>
          </div>
          
          <ExerciseSelector 
            exercises={exercises}
            selectedExercise={selectedExercise}
            onSelectExercise={setSelectedExercise}
          />
        </div>

        <CollapsibleContent className="h-[320px]">
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
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
                  domain={[0, 500]} // Set max to 500kg as requested
                  tickFormatter={(value: number) => `${value} kg`}
                />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} kg`, t('maxWeight')]}
                />
                <Area
                  type="monotone"
                  dataKey="maxWeight"
                  stroke="hsl(var(--accent))"
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  strokeWidth={2}
                  name={t('maxWeight')}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {exercises.length > 0
                ? t('notEnoughDataExercise')
                : t('addWorkoutsToSeeProgress')}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ProgressChart;
