'use client';

import { LiquidInput } from '@/components/ui/LiquidInput';
import { LiquidSelect } from '@/components/ui/LiquidSelect';
import { FlowCard } from '@/components/ui/FlowCard';
import { LiquidButton } from '@/components/ui/LiquidButton';
import { OnboardingFormData } from './OnboardingWizard';
import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute}`,
    label: `${hour.toString().padStart(2, '0')}:${minute}`
  };
});

export function AvailabilityStep({ formData, updateFormData, errors }: AvailabilityStepProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');

  useEffect(() => {
    if (!formData.timezone) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      updateFormData({ timezone: userTimezone });
    }
  }, [formData.timezone, updateFormData]);

  const addTimeSlot = () => {
    if (startTime && endTime && startTime < endTime) {
      updateFormData({
        availability: [
          ...formData.availability,
          { dayOfWeek: selectedDay, startTime, endTime }
        ]
      });
    }
  };

  const removeTimeSlot = (index: number) => {
    updateFormData({
      availability: formData.availability.filter((_, i) => i !== index)
    });
  };

  const addException = () => {
    if (exceptionDate) {
      updateFormData({
        unavailabilityExceptions: [
          ...formData.unavailabilityExceptions,
          { date: exceptionDate, reason: exceptionReason }
        ]
      });
      setExceptionDate('');
      setExceptionReason('');
    }
  };

  const removeException = (index: number) => {
    updateFormData({
      unavailabilityExceptions: formData.unavailabilityExceptions.filter((_, i) => i !== index)
    });
  };

  const availabilityByDay = DAYS_OF_WEEK.map((day, index) => ({
    day,
    slots: formData.availability.filter((slot) => slot.dayOfWeek === index),
    dayIndex: index
  }));

  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-liquid-dark-primary">
          Set Your Availability
        </h2>
        <p className="text-base font-light text-gray-500 max-w-md mx-auto">
          When are you available to guide?
        </p>
      </div>

      {/* Add Time Slot */}
      <FlowCard padding="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-light tracking-wide text-liquid-dark-secondary">
            <Plus className="h-4 w-4" />
            Add Time Slot
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LiquidSelect
              label="Day"
              value={selectedDay.toString()}
              onValueChange={(value) => setSelectedDay(parseInt(value))}
              options={DAYS_OF_WEEK.map((day, i) => ({ value: i.toString(), label: day }))}
              icon={Calendar}
            />

            <LiquidSelect
              label="Start Time"
              value={startTime}
              onValueChange={setStartTime}
              options={TIME_OPTIONS}
              icon={Clock}
            />

            <LiquidSelect
              label="End Time"
              value={endTime}
              onValueChange={setEndTime}
              options={TIME_OPTIONS}
              icon={Clock}
            />

            <div className="flex items-end">
              <LiquidButton
                onClick={addTimeSlot}
                variant="primary"
                className="w-full"
              >
                <Plus className="h-4 w-4" />
                Add
              </LiquidButton>
            </div>
          </div>
        </div>
      </FlowCard>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        <h3 className="text-sm font-light tracking-wide text-liquid-dark-secondary">
          Weekly Schedule {errors.availability && <span className="text-ui-error ml-1">*</span>}
        </h3>

        {availabilityByDay.some(d => d.slots.length > 0) ? (
          <div className="grid grid-cols-1 gap-3">
            {availabilityByDay.filter(d => d.slots.length > 0).map((dayData) => (
              <FlowCard key={dayData.day} padding="md" variant="subtle">
                <div className="space-y-3">
                  <h4 className="font-medium text-liquid-dark-primary text-sm">{dayData.day}</h4>
                  <div className="space-y-2">
                    {dayData.slots.map((slot, slotIndex) => {
                      const globalIndex = formData.availability.findIndex(
                        s => s.dayOfWeek === dayData.dayIndex && s.startTime === slot.startTime && s.endTime === slot.endTime
                      );
                      return (
                        <div
                          key={slotIndex}
                          className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 hover:border-liquid-dark-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-3 text-sm">
                            <Clock className="h-4 w-4 text-liquid-dark-secondary" />
                            <span className="font-medium text-liquid-dark-primary">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(globalIndex)}
                            className="text-gray-400 hover:text-ui-error transition-colors p-1 rounded-full hover:bg-ui-error/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FlowCard>
            ))}
          </div>
        ) : (
          <FlowCard padding="md" variant="subtle">
            <p className="text-center text-sm text-gray-500 py-8">
              No availability added yet. Add your first time slot above.
            </p>
          </FlowCard>
        )}

        {errors.availability && (
          <p className="text-xs font-light text-ui-error">{errors.availability}</p>
        )}
      </div>

      {/* Unavailable Dates */}
      <FlowCard padding="lg">
        <div className="space-y-4">
          <h3 className="text-sm font-light tracking-wide text-liquid-dark-secondary">
            Unavailable Dates (Optional)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LiquidInput
              label="Date"
              type="date"
              value={exceptionDate}
              onChange={(e) => setExceptionDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />

            <LiquidInput
              label="Reason (Optional)"
              value={exceptionReason}
              onChange={(e) => setExceptionReason(e.target.value)}
              placeholder="e.g., Exam week"
            />

            <div className="flex items-end">
              <LiquidButton
                onClick={addException}
                variant="secondary"
                className="w-full"
              >
                Add Exception
              </LiquidButton>
            </div>
          </div>

          {formData.unavailabilityExceptions.length > 0 && (
            <div className="space-y-2 mt-4">
              {formData.unavailabilityExceptions.map((exception, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-liquid-light rounded-2xl border border-gray-100"
                >
                  <div className="text-sm">
                    <span className="font-medium text-liquid-dark-primary">{exception.date}</span>
                    {exception.reason && (
                      <span className="text-gray-500 ml-2">- {exception.reason}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeException(index)}
                    className="text-gray-400 hover:text-ui-error transition-colors p-1 rounded-full hover:bg-ui-error/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FlowCard>

      {/* Timezone Display */}
      <div className="bg-liquid-light/50 rounded-2xl p-4 flex gap-3 items-center border border-gray-100">
        <Clock className="h-5 w-5 text-liquid-dark-secondary shrink-0" />
        <div>
          <p className="text-xs font-medium text-liquid-dark-primary">Timezone</p>
          <p className="text-xs text-gray-600">{formData.timezone || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
}
