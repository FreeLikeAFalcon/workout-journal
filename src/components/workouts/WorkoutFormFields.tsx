
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WorkoutFormFieldsProps {
  workoutDate: string;
  setWorkoutDate: (date: string) => void;
  program: string;
  setProgram: (program: string) => void;
  phase: string;
  setPhase: (phase: string) => void;
}

const WorkoutFormFields: React.FC<WorkoutFormFieldsProps> = ({
  workoutDate,
  setWorkoutDate,
  program,
  setProgram,
  phase,
  setPhase,
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label className="block text-sm text-muted-foreground mb-1">{t('date')}</label>
        <input
          type="date"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          className="w-full p-2 border border-input rounded-lg bg-transparent"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm text-muted-foreground mb-1">{t('program')}</label>
        <input
          type="text"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="w-full p-2 border border-input rounded-lg bg-transparent"
          placeholder={t('programName')}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm text-muted-foreground mb-1">{t('phase')}</label>
        <input
          type="text"
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          className="w-full p-2 border border-input rounded-lg bg-transparent"
          placeholder={t('programPhase')}
          required
        />
      </div>
    </div>
  );
};

export default WorkoutFormFields;
