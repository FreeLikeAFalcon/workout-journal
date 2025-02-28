
import React, { useState } from "react";
import { BodyGoal } from "@/types/metrics";
import { useMetrics } from "@/contexts/MetricsContext";
import { Dumbbell, Plus, X, Target, Scale, Ruler } from "lucide-react";

type MetricType = "weight" | "bodyFat" | "muscleMass";

const MetricsForm: React.FC = () => {
  const { metrics, addMetric, setGoal } = useMetrics();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<MetricType>("weight");
  const [metricValue, setMetricValue] = useState<number | "">("");
  const [goalValue, setGoalValue] = useState<number | "">("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [isGoalMode, setIsGoalMode] = useState(false);

  const calculateBodyFatKg = (weightKg: number, bodyFatPercentage: number) => {
    return (weightKg * bodyFatPercentage) / 100;
  };

  const calculateMuscleMassKg = (weightKg: number, muscleMassPercentage: number) => {
    return (weightKg * muscleMassPercentage) / 100;
  };

  const calculateCurrentBodyFatKg = () => {
    const latestWeight = metrics.weight.entries.length > 0 
      ? metrics.weight.entries[metrics.weight.entries.length - 1].value 
      : 0;
    const latestBodyFat = metrics.bodyFat.entries.length > 0 
      ? metrics.bodyFat.entries[metrics.bodyFat.entries.length - 1].value 
      : 0;
    
    return calculateBodyFatKg(latestWeight, latestBodyFat);
  };

  const calculateCurrentMuscleMassKg = () => {
    const latestWeight = metrics.weight.entries.length > 0 
      ? metrics.weight.entries[metrics.weight.entries.length - 1].value 
      : 0;
    const latestMuscleMass = metrics.muscleMass.entries.length > 0 
      ? metrics.muscleMass.entries[metrics.muscleMass.entries.length - 1].value 
      : 0;
    
    return calculateMuscleMassKg(latestWeight, latestMuscleMass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (metricValue !== "" && !isGoalMode) {
      addMetric(activeTab, Number(metricValue));
      setMetricValue("");
      setIsFormVisible(false);
    } else if (goalValue !== "" && isGoalMode) {
      const newGoal: BodyGoal = {
        target: Number(goalValue),
        deadline: goalDeadline || undefined,
      };
      setGoal(activeTab, newGoal);
      setGoalValue("");
      setGoalDeadline("");
      setIsGoalMode(false);
      setIsFormVisible(false);
    }
  };

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    setIsGoalMode(false);
    setMetricValue("");
    setGoalValue("");
  };

  const getLatestValue = (type: MetricType) => {
    const entries = metrics[type].entries;
    return entries.length > 0 ? entries[entries.length - 1].value : "Keine Daten";
  };

  const getProgressPercentage = (type: MetricType) => {
    const entries = metrics[type].entries;
    const goal = metrics[type].goal;
    
    if (!goal || entries.length === 0) return null;
    
    const latestValue = entries[entries.length - 1].value;
    const startValue = entries[0].value;
    const targetValue = goal.target;
    
    // If we want to decrease (e.g., weight loss or body fat reduction)
    if (targetValue < startValue) {
      const totalChange = startValue - targetValue;
      const currentChange = startValue - latestValue;
      return Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
    } 
    // If we want to increase (e.g., muscle mass gain)
    else {
      const totalChange = targetValue - startValue;
      const currentChange = latestValue - startValue;
      return Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
    }
  };

  const getTabIcon = (type: MetricType) => {
    switch (type) {
      case "weight":
        return <Scale size={18} />;
      case "bodyFat":
        return <Ruler size={18} />;
      case "muscleMass":
        return <Dumbbell size={18} />;
    }
  };
  
  const getUnit = (type: MetricType) => metrics[type].unit;

  return (
    <div className="mb-8 animate-slide-up">
      {!isFormVisible ? (
        <button
          onClick={toggleForm}
          className="glass-card flex items-center justify-center w-full p-4 gap-2 rounded-xl text-primary font-medium hover:shadow-md transition-all"
        >
          <Plus size={18} />
          Körperwerte erfassen
        </button>
      ) : (
        <div className="glass-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {isGoalMode ? "Ziel setzen" : "Körperwerte erfassen"}
            </h2>
            <button
              onClick={toggleForm}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="flex mb-6 border-b">
            <button
              className={`p-3 mr-2 ${activeTab === "weight" ? "border-b-2 border-primary" : ""}`}
              onClick={() => setActiveTab("weight")}
            >
              <div className="flex items-center gap-2">
                <Scale size={18} />
                <span>Gewicht</span>
              </div>
            </button>
            <button
              className={`p-3 mr-2 ${activeTab === "bodyFat" ? "border-b-2 border-primary" : ""}`}
              onClick={() => setActiveTab("bodyFat")}
            >
              <div className="flex items-center gap-2">
                <Ruler size={18} />
                <span>Körperfett</span>
              </div>
            </button>
            <button
              className={`p-3 ${activeTab === "muscleMass" ? "border-b-2 border-primary" : ""}`}
              onClick={() => setActiveTab("muscleMass")}
            >
              <div className="flex items-center gap-2">
                <Dumbbell size={18} />
                <span>Muskelmasse</span>
              </div>
            </button>
          </div>
          
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="glass-card p-4 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Aktueller Wert</div>
                <div className="text-xl font-semibold">
                  {getLatestValue(activeTab)} {getUnit(activeTab)}
                  {activeTab === "bodyFat" && metrics.weight.entries.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {calculateCurrentBodyFatKg().toFixed(1)} kg
                    </div>
                  )}
                  {activeTab === "muscleMass" && metrics.weight.entries.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {calculateCurrentMuscleMassKg().toFixed(1)} kg
                    </div>
                  )}
                </div>
              </div>
              
              <div className="glass-card p-4 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Zielwert</div>
                <div className="text-xl font-semibold">
                  {metrics[activeTab].goal ? (
                    <>
                      {metrics[activeTab].goal.target} {getUnit(activeTab)}
                      {metrics[activeTab].goal.deadline && (
                        <div className="text-sm text-muted-foreground mt-1">
                          bis {new Date(metrics[activeTab].goal.deadline).toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Kein Ziel</span>
                  )}
                </div>
              </div>
            </div>
            
            {metrics[activeTab].goal && getProgressPercentage(activeTab) !== null && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Fortschritt</span>
                  <span>{getProgressPercentage(activeTab)?.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full" 
                    style={{ width: `${getProgressPercentage(activeTab)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              {!isGoalMode ? (
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    {getTabIcon(activeTab)} Neuer {activeTab === "weight" ? "Gewichts" : activeTab === "bodyFat" ? "Körperfett" : "Muskelmasse"}wert
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={metricValue}
                      onChange={(e) => setMetricValue(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      step="0.1"
                      min="0"
                      className="flex-1 p-2 border border-input rounded-lg bg-transparent"
                      placeholder={`${activeTab === "weight" ? "Gewicht" : activeTab === "bodyFat" ? "Körperfett" : "Muskelmasse"} in ${getUnit(activeTab)}`}
                      required
                    />
                    <span className="text-muted-foreground">{getUnit(activeTab)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      <Target size={18} className="inline mr-2" />
                      Zielwert
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={goalValue}
                        onChange={(e) => setGoalValue(e.target.value === "" ? "" : parseFloat(e.target.value))}
                        step="0.1"
                        min="0"
                        className="flex-1 p-2 border border-input rounded-lg bg-transparent"
                        placeholder={`Ziel in ${getUnit(activeTab)}`}
                        required
                      />
                      <span className="text-muted-foreground">{getUnit(activeTab)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Zieldatum (optional)
                    </label>
                    <input
                      type="date"
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                      className="w-full p-2 border border-input rounded-lg bg-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setIsGoalMode(!isGoalMode)}
                className="text-accent hover:underline"
              >
                {isGoalMode ? "Wert erfassen" : "Ziel setzen"}
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                disabled={(isGoalMode && goalValue === "") || (!isGoalMode && metricValue === "")}
              >
                {isGoalMode ? "Ziel speichern" : "Wert speichern"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MetricsForm;
