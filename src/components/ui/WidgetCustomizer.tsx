
import React, { useState } from "react";
import { useMetrics } from "@/contexts/MetricsContext";
import { WidgetConfig, WidgetType } from "@/types/metrics";
import { GripVertical, LayoutGrid, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

interface WidgetCustomizerProps {
  onClose: () => void;
}

const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({ onClose }) => {
  const { widgets, updateWidgets } = useMetrics();
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[]>([...widgets]);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const { t } = useLanguage();

  const getWidgetName = (type: WidgetType): string => {
    switch (type) {
      case WidgetType.TOTAL_WORKOUTS:
        return t('workouts.total');
      case WidgetType.TOTAL_EXERCISES:
        return t('exercises.total');
      case WidgetType.TOTAL_SETS:
        return t('sets.total');
      case WidgetType.MOST_FREQUENT_EXERCISE:
        return t('exercise.mostFrequent');
      case WidgetType.CURRENT_WEIGHT:
        return t('metrics.currentWeight');
      case WidgetType.WEIGHT_GOAL:
        return t('metrics.weightGoal');
      case WidgetType.BODY_FAT:
        return t('metrics.bodyFat');
      case WidgetType.MUSCLE_MASS:
        return t('metrics.muscleMass');
    }
  };

  const toggleVisibility = (id: string) => {
    setLocalWidgets(localWidgets.map(widget => 
      widget.id === id ? { ...widget, visible: !widget.visible } : widget
    ));
  };

  const handleDragStart = (id: string) => {
    setDraggedWidget(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === id) return;

    const sourceWidget = localWidgets.find(w => w.id === draggedWidget);
    const targetWidget = localWidgets.find(w => w.id === id);
    
    if (!sourceWidget || !targetWidget) return;

    // Swap positions
    const newWidgets = localWidgets.map(widget => {
      if (widget.id === draggedWidget) {
        return { ...widget, position: targetWidget.position };
      }
      if (widget.id === id) {
        return { ...widget, position: sourceWidget.position };
      }
      return widget;
    });

    // Sort by position
    newWidgets.sort((a, b) => a.position - b.position);
    setLocalWidgets(newWidgets);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const saveChanges = () => {
    updateWidgets(localWidgets);
    onClose();
  };

  // Filter to ensure each widget type appears only once and is correctly sorted by position
  const uniqueWidgets = [...new Map(localWidgets.map(widget => [widget.type, widget])).values()];
  uniqueWidgets.sort((a, b) => a.position - b.position);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-xl max-w-md w-full p-6 animate-fade-in dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <LayoutGrid size={20} />
            {t('widgets.customize')}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Ziehe die widgets, um ihre reihenfolge zu ändern. Klicke auf ein widget, um es ein- oder auszublenden.
        </p>
        
        <ScrollArea className="mb-6 h-[200px] pr-4">
          <div className="space-y-2">
            {uniqueWidgets.map(widget => (
              <div
                key={widget.id}
                draggable
                onDragStart={() => handleDragStart(widget.id)}
                onDragOver={(e) => handleDragOver(e, widget.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  widget.visible ? "border-accent/30 bg-accent/5" : "border-border"
                } cursor-move`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-muted-foreground" />
                  <span>{getWidgetName(widget.type)}</span>
                </div>
                <button
                  onClick={() => toggleVisibility(widget.id)}
                  className={`w-5 h-5 rounded-sm flex items-center justify-center ${
                    widget.visible ? "bg-accent text-white" : "border border-muted-foreground"
                  }`}
                  aria-label={widget.visible ? "Widget ausblenden" : "Widget einblenden"}
                >
                  {widget.visible && <span className="w-2 h-2">✓</span>}
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-input rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={saveChanges}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetCustomizer;
