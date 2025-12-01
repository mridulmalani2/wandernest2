'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ModernInput } from '@/components/ui/ModernInput';
import { ModernSelect } from '@/components/ui/ModernSelect';
import { OnboardingFormData } from './OnboardingWizard';
import { Clock, Calendar, Globe, Plus, Trash2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

const DURATION_OPTIONS = ['1 hour', '2 hours', '3-4 hours', 'Half day (4-6 hours)', 'Full day (6+ hours)'];

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
];

export function AvailabilityStep({ formData, updateFormData, errors }: AvailabilityStepProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [note, setNote] = useState('');

  // One-time exception states
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');

  const addAvailabilitySlot = () => {
    if (selectedDay === null) {
      alert('Please select a day');
      return;
    }

    // Validate time range
    const start = startTime.split(':').map(Number);
    const end = endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    if (endMinutes <= startMinutes) {
      alert('End time must be after start time');
      return;
    }

    const duration = endMinutes - startMinutes;
    if (duration < 180) {
      alert('Time slot must be at least 3 hours long (most experiences are 3-4 hours)');
      return;
    }

    // Check for overlapping slots
    const overlapping = formData.availability.some(
      (slot) =>
        slot.dayOfWeek === selectedDay &&
        ((startTime >= slot.startTime && startTime < slot.endTime) ||
          (endTime > slot.startTime && endTime <= slot.endTime) ||
          (startTime <= slot.startTime && endTime >= slot.endTime))
    );

    if (overlapping) {
      alert('This time slot overlaps with an existing slot for this day');
      return;
    }

    const newSlot = {
      dayOfWeek: selectedDay,
      startTime,
      endTime,
      note: note.trim() || undefined,
    };

    updateFormData({
      availability: [...formData.availability, newSlot],
    });

    // Reset form
    setNote('');
  };

  const removeSlot = (index: number) => {
    updateFormData({
      availability: formData.availability.filter((_, i) => i !== index),
    });
  };

  const addException = () => {
    if (!exceptionDate) {
      alert('Please select a date');
      return;
    }

    const exceptions = formData.unavailabilityExceptions || [];
    const exists = exceptions.some((ex) => ex.date === exceptionDate);

    if (exists) {
      alert('This date is already added');
      return;
    }

    updateFormData({
      unavailabilityExceptions: [
        ...exceptions,
        {
          date: exceptionDate,
          reason: exceptionReason.trim() || undefined,
        },
      ],
    });

    setExceptionDate('');
    setExceptionReason('');
  };

  const removeException = (index: number) => {
    updateFormData({
      unavailabilityExceptions: formData.unavailabilityExceptions.filter((_, i) => i !== index),
    });
  };

  const toggleDuration = (duration: string) => {
    const durations = formData.preferredDurations || [];
    if (durations.includes(duration)) {
      updateFormData({
        preferredDurations: durations.filter((d) => d !== duration),
      });
    } else {
      updateFormData({
        preferredDurations: [...durations, duration],
      });
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startArr = start.split(':').map(Number);
    const endArr = end.split(':').map(Number);
    const minutes = (endArr[0] * 60 + endArr[1]) - (startArr[0] * 60 + startArr[1]);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Group availability by day
  const availabilityByDay = DAYS_OF_WEEK.map((day) => ({
    ...day,
    slots: formData.availability.filter((slot) => slot.dayOfWeek === day.value),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent mb-2">
          Set Your Availability
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          Define your weekly schedule. You can always update this later in your dashboard.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-ui-blue-primary/5 border border-ui-blue-primary/20 rounded-2xl p-6 flex gap-4 items-start">
        <div className="p-2 bg-white rounded-xl shadow-sm text-ui-blue-primary shrink-0">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-2">Availability Guidelines</h3>
          <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
            <li>Most experiences are 3-4 hours long</li>
            <li>Time blocks must be at least 3 hours</li>
            <li>Be realistic - only set times you can consistently commit to</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Add Slots */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-ui-blue-primary/10 flex items-center justify-center text-ui-blue-primary">
                <Plus className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-gray-800">Add Time Slot</h3>
            </div>

            <div className="space-y-6">
              {/* Day Selection */}
              <div className="space-y-3">
                <Label>Select Day</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => setSelectedDay(day.value)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium transition-all duration-200 border-2",
                        selectedDay === day.value
                          ? "border-ui-blue-primary bg-ui-blue-primary text-white shadow-md transform scale-105"
                          : "border-gray-100 bg-white text-gray-600 hover:border-ui-blue-primary/30 hover:bg-gray-50"
                      )}
                    >
                      {day.label.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <ModernSelect
                  label="Start Time"
                  value={startTime}
                  onValueChange={setStartTime}
                  options={TIME_SLOTS}
                  icon={Clock}
                />
                <ModernSelect
                  label="End Time"
                  value={endTime}
                  onValueChange={setEndTime}
                  options={TIME_SLOTS}
                  icon={Clock}
                />
              </div>

              {/* Optional Note */}
              <ModernInput
                label="Note (Optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Not available during exam weeks"
              />

              <Button
                type="button"
                onClick={addAvailabilitySlot}
                className="w-full h-12 rounded-xl bg-ui-blue-primary hover:bg-ui-blue-accent text-white font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Add Time Slot
              </Button>
            </div>
          </div>

          {/* Timezone & Durations */}
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-6">
            <ModernSelect
              label="Timezone"
              value={formData.timezone}
              onValueChange={(value) => updateFormData({ timezone: value })}
              options={TIMEZONE_OPTIONS}
              error={errors.timezone}
              icon={Globe}
            />

            <div className="space-y-3">
              <Label className={errors.preferredDurations ? "text-ui-error" : ""}>
                Preferred Session Lengths
              </Label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((duration) => {
                  const isSelected = formData.preferredDurations.includes(duration);
                  return (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => toggleDuration(duration)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium transition-all duration-200 border-2 text-sm",
                        isSelected
                          ? "border-ui-purple-primary bg-ui-purple-primary/10 text-ui-purple-primary shadow-sm"
                          : "border-gray-100 bg-white text-gray-600 hover:border-ui-purple-primary/30"
                      )}
                    >
                      {duration}
                    </button>
                  );
                })}
              </div>
              {errors.preferredDurations && <p className="text-xs text-ui-error">{errors.preferredDurations}</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Schedule Summary */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 shadow-lg h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <h3 className="font-bold text-gray-800">Weekly Schedule</h3>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {formData.availability.length} slots
              </span>
            </div>

            {formData.availability.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl">
                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No time slots added</p>
                <p className="text-xs text-gray-400 mt-1">Add your availability to continue</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {availabilityByDay.map(
                  (day) =>
                    day.slots.length > 0 && (
                      <div key={day.value} className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{day.label}</h4>
                        {day.slots.map((slot, index) => {
                          const globalIndex = formData.availability.indexOf(slot);
                          return (
                            <div
                              key={globalIndex}
                              className="group relative bg-gray-50 border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-white"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm">
                                    {slot.startTime} - {slot.endTime}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {calculateDuration(slot.startTime, slot.endTime)}
                                  </p>
                                  {slot.note && (
                                    <p className="text-xs text-ui-blue-primary mt-1.5 bg-ui-blue-primary/5 px-2 py-1 rounded-md inline-block">
                                      {slot.note}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSlot(globalIndex)}
                                  className="text-gray-300 hover:text-ui-error transition-colors p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                )}
              </div>
            )}
            {errors.availability && <p className="text-xs text-ui-error mt-4 text-center">{errors.availability}</p>}
          </div>

          {/* Exceptions Section */}
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Unavailable Dates</h3>

            <div className="space-y-3 mb-4">
              <ModernInput
                type="date"
                value={exceptionDate}
                onChange={(e) => setExceptionDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="h-10 text-sm"
              />
              <ModernInput
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                placeholder="Reason (e.g. Exams)"
                className="h-10 text-sm"
              />
              <Button
                type="button"
                onClick={addException}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Add Date
              </Button>
            </div>

            {formData.unavailabilityExceptions.length > 0 && (
              <div className="space-y-2">
                {formData.unavailabilityExceptions.map((exception, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        {new Date(exception.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                      {exception.reason && (
                        <p className="text-xs text-gray-500">{exception.reason}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeException(index)}
                      className="text-gray-400 hover:text-ui-error"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
