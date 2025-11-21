'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  name: string;
  description: string;
}

interface FormProgressHeaderProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export function FormProgressHeader({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  className,
}: FormProgressHeaderProps) {
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId) || stepId < currentStep;
  const isStepCurrent = (stepId: number) => stepId === currentStep;
  const isStepUpcoming = (stepId: number) => stepId > currentStep && !completedSteps.includes(stepId);

  const handleStepClick = (stepId: number) => {
    if (onStepClick) {
      onStepClick(stepId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, stepId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStepClick(stepId);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile Progress Indicator */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-white">{currentStep}</span>
              <span className="text-sm text-white/70">/ {steps.length}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">
              {steps[currentStep - 1].name}
            </p>
            <p className="text-xs text-white/70">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 rounded-full transition-all duration-500 ease-out shadow-lg shadow-teal-500/30"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Mobile Step Indicators */}
        <div className="flex justify-between mt-4 px-1">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              onKeyPress={(e) => handleKeyPress(e, step.id)}
              disabled={!onStepClick}
              aria-label={`${step.name}: ${
                isStepCompleted(step.id) ? 'Completed' : isStepCurrent(step.id) ? 'Current step' : 'Upcoming'
              }`}
              aria-current={isStepCurrent(step.id) ? 'step' : undefined}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent',
                isStepCompleted(step.id) && 'bg-teal-500 text-white shadow-md shadow-teal-500/40 scale-100',
                isStepCurrent(step.id) && 'bg-white text-teal-600 shadow-lg shadow-white/50 scale-110 ring-2 ring-white/30 ring-offset-2 ring-offset-teal-500/20',
                isStepUpcoming(step.id) && 'bg-white/30 text-white/60 scale-90',
                onStepClick && !isStepCurrent(step.id) && 'hover:scale-105 cursor-pointer'
              )}
            >
              {isStepCompleted(step.id) ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step.id
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Progress Stepper */}
      <div className="hidden md:block">
        <div className="relative">
          <nav aria-label="Form progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, index) => {
                const completed = isStepCompleted(step.id);
                const current = isStepCurrent(step.id);
                const upcoming = isStepUpcoming(step.id);

                return (
                  <li key={step.id} className="relative flex-1 group">
                    <div className="flex flex-col items-center">
                      {/* Connecting Line (before the circle) */}
                      {index > 0 && (
                        <div className="absolute left-0 right-1/2 top-6 -translate-y-1/2 h-0.5 -z-10">
                          <div
                            className={cn(
                              'h-full transition-all duration-500 ease-out',
                              isStepCompleted(steps[index - 1].id) ? 'bg-teal-500' : 'bg-white/20'
                            )}
                          />
                        </div>
                      )}

                      {/* Connecting Line (after the circle) */}
                      {index < steps.length - 1 && (
                        <div className="absolute left-1/2 right-0 top-6 -translate-y-1/2 h-0.5 -z-10">
                          <div
                            className={cn(
                              'h-full transition-all duration-500 ease-out',
                              completed ? 'bg-teal-500' : 'bg-white/20'
                            )}
                          />
                        </div>
                      )}

                      {/* Step Circle */}
                      <button
                        onClick={() => handleStepClick(step.id)}
                        onKeyPress={(e) => handleKeyPress(e, step.id)}
                        disabled={!onStepClick}
                        aria-label={`Step ${step.id}: ${step.name}. ${
                          completed ? 'Completed' : current ? 'Current step' : 'Upcoming'
                        }`}
                        aria-current={current ? 'step' : undefined}
                        className={cn(
                          'relative w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base transition-all duration-300 focus:outline-none focus:ring-3 focus:ring-white focus:ring-offset-4 focus:ring-offset-transparent z-10',
                          completed && 'bg-teal-500 text-white shadow-md hover:shadow-lg hover:shadow-teal-500/30',
                          current && 'bg-white text-teal-600 shadow-xl shadow-white/40 scale-110 ring-4 ring-teal-400/30',
                          upcoming && 'bg-white/25 backdrop-blur-sm text-white/70 border border-white/30',
                          onStepClick && !current && 'hover:scale-105 cursor-pointer hover:shadow-lg',
                          onStepClick && upcoming && 'hover:bg-white/35 hover:border-white/50',
                          onStepClick && completed && 'hover:shadow-teal-500/50'
                        )}
                      >
                        {completed ? (
                          <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="relative">
                            {step.id}
                            {current && (
                              <span className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-20" />
                            )}
                          </span>
                        )}
                      </button>

                      {/* Step Label */}
                      <div className="mt-3 text-center max-w-[140px]">
                        <p
                          className={cn(
                            'text-sm font-medium transition-all duration-300 leading-tight',
                            current && 'text-white font-semibold text-base',
                            completed && 'text-white/90',
                            upcoming && 'text-white/60'
                          )}
                        >
                          {step.name}
                        </p>
                        <p
                          className={cn(
                            'text-xs mt-1 transition-all duration-300 leading-tight',
                            current && 'text-white/80 font-medium',
                            completed && 'text-white/70',
                            upcoming && 'text-white/50'
                          )}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Desktop Progress Bar (subtle background indicator) */}
        <div className="relative h-1 bg-white/10 rounded-full mt-6 overflow-hidden backdrop-blur-sm">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 rounded-full transition-all duration-700 ease-out shadow-lg shadow-teal-500/20"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
