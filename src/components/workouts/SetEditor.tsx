
import React from "react";
import { Set } from "@/types/workout";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateSetVolume } from "@/utils/workoutUtils";

interface SetEditorProps {
  isNew?: boolean;
  set?: Set;
  index?: number;
  newSet: { reps: number; weight: number };
  onSetChange: (set: { reps: number; weight: number }) => void;
  onSave: () => void;
}

const SetEditor: React.FC<SetEditorProps> = ({ 
  isNew = false, 
  set, 
  index, 
  newSet, 
  onSetChange, 
  onSave 
}) => {
  return (
    <div className="grid grid-cols-12 gap-2 items-center bg-accent/5 p-2 rounded-md">
      <div className="col-span-1">{isNew ? '+' : index! + 1}</div>
      <div className="col-span-3">
        <input 
          type="number" 
          value={newSet.reps} 
          onChange={(e) => onSetChange({...newSet, reps: parseInt(e.target.value) || 0})}
          className="w-full p-1 text-sm border rounded bg-background"
          min="0"
        />
      </div>
      <div className="col-span-3">
        <input 
          type="number" 
          value={newSet.weight} 
          onChange={(e) => onSetChange({...newSet, weight: parseInt(e.target.value) || 0})}
          className="w-full p-1 text-sm border rounded bg-background"
          min="0"
        />
      </div>
      <div className="col-span-3 text-sm">{calculateSetVolume({...newSet, id: set?.id || ''})}</div>
      <div className="col-span-2 flex justify-end">
        <Button 
          size="sm" 
          variant="default" 
          className="h-7 w-7 p-0" 
          onClick={onSave}
        >
          <Check size={14} />
        </Button>
      </div>
    </div>
  );
};

export default SetEditor;
