import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Archive } from "lucide-react";
import SavedWorkoutLibrary from "./SavedWorkoutLibrary";
import { Exercise, BrandingConfig } from "@/types/workout";

interface SavedWorkoutLibraryButtonProps {
  currentExercises: Exercise[];
  branding: BrandingConfig;
  onLoadWorkout: (exercises: Exercise[]) => void;
}

const SavedWorkoutLibraryButton = ({ currentExercises, branding, onLoadWorkout }: SavedWorkoutLibraryButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Archive className="h-4 w-4 mr-2" />
          Biblioteca de Treinos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Biblioteca de Treinos Salvos</DialogTitle>
        </DialogHeader>
        <SavedWorkoutLibrary
          currentExercises={currentExercises}
          branding={branding}
          onLoadWorkout={(exercises) => {
            onLoadWorkout(exercises);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SavedWorkoutLibraryButton;