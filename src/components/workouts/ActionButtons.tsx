
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash } from "lucide-react";

interface ActionButtonsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={(e) => {
          e.stopPropagation();
          onEdit(e);
        }}
        aria-label="Edit"
      >
        <Edit2 size={16} />
      </Button>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
        aria-label="Delete"
      >
        <Trash size={16} />
      </Button>
    </div>
  );
};

export default ActionButtons;
