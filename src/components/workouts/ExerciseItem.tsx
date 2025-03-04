import React, { useState } from "react";
import { Exercise, Set } from "@/types/workout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Check, Edit, Plus, Trash, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateExerciseVolume, calculateSetVolume, getMaxWeight } from "@/utils/workoutUtils";

export interface ExerciseItemProps {
  exercise: Exercise;
  workoutId: string;
  isPersonalRecord: boolean;
  isEditMode?: boolean;
  onRemoveExercise: () => void;
  onAddSet: (set: { reps: number; weight: number }) => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, set: { reps: number; weight: number }) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  workoutId,
  isPersonalRecord,
  isEditMode = false,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}) => {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [newSet, setNewSet] = useState<{ reps: number; weight: number }>({ reps: 8, weight: 0 });
  
  const totalVolume = calculateExerciseVolume(exercise);
  const maxWeight = getMaxWeight(exercise);
  
  const handleAddSet = () => {
    onAddSet(newSet);
    setNewSet({ reps: 8, weight: 0 });
    setIsAdding(false);
  };
  
  const startEditSet = (set: Set) => {
    setEditingSetId(set.id);
    setNewSet({ reps: set.reps, weight: set.weight });
  };
  
  const handleUpdateSet = () => {
    if (editingSetId) {
      onUpdateSet(editingSetId, newSet);
      setEditingSetId(null);
      setNewSet({ reps: 8, weight: 0 });
    }
  };
  
  return (
    <Card className={`border ${isPersonalRecord ? 'border-yellow-500 dark:border-yellow-600' : 'border-border'}`}>
      <CardHeader className="py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">{exercise.name}</CardTitle>
            {isPersonalRecord && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400">
                <Trophy size={12} className="mr-1" /> {t('personalRecord')}
              </Badge>
            )}
          </div>
          
          {isEditMode && (
            <Button 
              size="sm" 
              variant="destructive" 
              className="h-8 w-8 p-0" 
              onClick={onRemoveExercise}
            >
              <Trash size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-2">
        {exercise.sets.length === 0 ? (
          <div className="text-center text-muted-foreground py-2">
            <p>{t('exercise.noSets')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-xs text-muted-foreground mb-1 px-1">
              <div className="col-span-1">#</div>
              <div className="col-span-3">{t('reps')}</div>
              <div className="col-span-3">{t('weight')}</div>
              <div className="col-span-3">{t('volume')}</div>
              <div className="col-span-2"></div>
            </div>
            
            {exercise.sets.map((set, index) => (
              <div key={set.id} className="grid grid-cols-12 items-center bg-accent/5 p-2 rounded-md">
                {editingSetId === set.id ? (
                  <>
                    <div className="col-span-1">{index + 1}</div>
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        value={newSet.reps} 
                        onChange={(e) => setNewSet({...newSet, reps: parseInt(e.target.value) || 0})}
                        className="w-full p-1 text-sm border rounded bg-background"
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        value={newSet.weight} 
                        onChange={(e) => setNewSet({...newSet, weight: parseInt(e.target.value) || 0})}
                        className="w-full p-1 text-sm border rounded bg-background"
                      />
                    </div>
                    <div className="col-span-3 text-sm">{calculateSetVolume({...newSet, id: ''})}</div>
                    <div className="col-span-2 flex justify-end">
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="h-7 w-7 p-0" 
                        onClick={handleUpdateSet}
                      >
                        <Check size={14} />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-1">{index + 1}</div>
                    <div className="col-span-3">{set.reps}</div>
                    <div className="col-span-3">{set.weight} kg</div>
                    <div className="col-span-3">{calculateSetVolume(set)}</div>
                    <div className="col-span-2 flex justify-end gap-1">
                      {isEditMode && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0" 
                            onClick={() => startEditSet(set)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="h-7 w-7 p-0" 
                            onClick={() => onRemoveSet(set.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        
        {isEditMode && (
          <div className="mt-4">
            {isAdding ? (
              <div className="grid grid-cols-12 gap-2 items-center bg-accent/5 p-2 rounded-md">
                <div className="col-span-1">+</div>
                <div className="col-span-3">
                  <input 
                    type="number" 
                    value={newSet.reps} 
                    onChange={(e) => setNewSet({...newSet, reps: parseInt(e.target.value) || 0})}
                    className="w-full p-1 text-sm border rounded bg-background"
                    min="0"
                  />
                </div>
                <div className="col-span-3">
                  <input 
                    type="number" 
                    value={newSet.weight} 
                    onChange={(e) => setNewSet({...newSet, weight: parseInt(e.target.value) || 0})}
                    className="w-full p-1 text-sm border rounded bg-background"
                    min="0"
                  />
                </div>
                <div className="col-span-3 text-sm">{calculateSetVolume({...newSet, id: ''})}</div>
                <div className="col-span-2 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="h-7 w-7 p-0" 
                    onClick={handleAddSet}
                  >
                    <Check size={14} />
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => setIsAdding(true)}
              >
                <Plus size={16} className="mr-1" /> {t('exercise.addSet')}
              </Button>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calculator size={14} className="mr-1" /> 
            {t('totalVolume')}: <span className="font-semibold ml-1">{totalVolume}</span>
          </div>
          <div>
            {t('maxWeight')}: <span className="font-semibold">{maxWeight} kg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseItem;
