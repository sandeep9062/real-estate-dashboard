"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  active: number;
  children: React.ReactNode;
  onStepClick?: (step: number) => void;
}

interface StepProps {
  icon?: React.ReactNode;
  label?: string;
  description?: string;
  children: React.ReactNode;
}

export const Stepper: React.FC<StepperProps> = ({ active, children, onStepClick }) => {
  return <div>{children}</div>;
};

export const Step: React.FC<StepProps> = ({ icon, label, description, children }) => {
  return <>{children}</>;
};

export const StepperCompleted: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const CustomStepper: React.FC<{
  steps: Array<{
    icon: React.ReactNode;
    label: string;
    description: string;
  }>;
  active: number;
  onStepClick?: (step: number) => void;
}> = ({ steps, active, onStepClick }) => {
  return (
    <div className="flex justify-between items-center mb-2">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center cursor-pointer" onClick={() => onStepClick?.(i)}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              active > i ? 'bg-blue-500 text-white' :
              active === i ? 'bg-blue-100 text-blue-500 border-2 border-blue-500' :
              'bg-gray-100 text-gray-400'
            }`}
          >
            {active > i ? <Check size={16} /> : i + 1}
          </div>
          <span className={`mt-2 text-xs ${active === i ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};
