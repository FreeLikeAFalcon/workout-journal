import React from "react";
import { useMetrics } from "@/contexts/MetricsContext";
import StatCard from "@/components/ui/StatCard";
import { Scale, Target, Ruler, Dumbbell } from "lucide-react";
import { WidgetType } from "@/types/metrics";

interface MetricStatCardsProps {
  widgetType?: WidgetType;
}

const MetricStatCards: React.FC<MetricStatCardsProps> = ({ widgetType }) => {
  const { metrics } = useMetrics();

  const getCurrentWeight = () => {
    const entries = metrics.weight.entries;
    return entries.length > 0 
      ? `${entries[entries.length - 1].value} kg` 
      : "Keine Daten";
  };

  const getWeightGoal = () => {
    return metrics.weight.goal 
      ? `${metrics.weight.goal.target} kg` 
      : "Kein Ziel";
  };

  const getBodyFat = () => {
    const entries = metrics.bodyFat.entries;
    
    if (entries.length === 0) return "Keine Daten";
    
    const value = entries[entries.length - 1].value;
    
    // Calculate kg if weight is available
    if (metrics.weight.entries.length > 0) {
      const weightValue = metrics.weight.entries[metrics.weight.entries.length - 1].value;
      const kgValue = (value * weightValue) / 100;
      return `${value}% (${kgValue.toFixed(1)} kg)`;
    }
    
    return `${value}%`;
  };

  const getMuscleMass = () => {
    const entries = metrics.muscleMass.entries;
    
    if (entries.length === 0) return "Keine Daten";
    
    const value = entries[entries.length - 1].value;
    
    // Calculate kg if weight is available
    if (metrics.weight.entries.length > 0) {
      const weightValue = metrics.weight.entries[metrics.weight.entries.length - 1].value;
      const kgValue = (value * weightValue) / 100;
      return `${value}% (${kgValue.toFixed(1)} kg)`;
    }
    
    return `${value}%`;
  };

  // If no specific widget type is requested, render all metrics (for backwards compatibility)
  if (!widgetType) {
    return (
      <>
        <StatCard
          title="Aktuelles Gewicht"
          value={getCurrentWeight()}
          icon={<Scale size={20} />}
          className="bg-blue-50/50 hover:bg-blue-50/80"
        />
        <StatCard
          title="Gewichtsziel"
          value={getWeightGoal()}
          icon={<Target size={20} />}
          className="bg-purple-50/50 hover:bg-purple-50/80"
        />
        <StatCard
          title="Körperfett"
          value={getBodyFat()}
          icon={<Ruler size={20} />}
          className="bg-red-50/50 hover:bg-red-50/80"
        />
        <StatCard
          title="Muskelmasse"
          value={getMuscleMass()}
          icon={<Dumbbell size={20} />}
          className="bg-green-50/50 hover:bg-green-50/80"
        />
      </>
    );
  }

  // Otherwise, render just the requested metric type
  switch (widgetType) {
    case WidgetType.CURRENT_WEIGHT:
      return (
        <StatCard
          title="Aktuelles Gewicht"
          value={getCurrentWeight()}
          icon={<Scale size={20} />}
          className="bg-blue-50/50 hover:bg-blue-50/80"
        />
      );
    case WidgetType.WEIGHT_GOAL:
      return (
        <StatCard
          title="Gewichtsziel"
          value={getWeightGoal()}
          icon={<Target size={20} />}
          className="bg-purple-50/50 hover:bg-purple-50/80"
        />
      );
    case WidgetType.BODY_FAT:
      return (
        <StatCard
          title="Körperfett"
          value={getBodyFat()}
          icon={<Ruler size={20} />}
          className="bg-red-50/50 hover:bg-red-50/80"
        />
      );
    case WidgetType.MUSCLE_MASS:
      return (
        <StatCard
          title="Muskelmasse"
          value={getMuscleMass()}
          icon={<Dumbbell size={20} />}
          className="bg-green-50/50 hover:bg-green-50/80"
        />
      );
    default:
      return null;
  }
};

export default MetricStatCards;
