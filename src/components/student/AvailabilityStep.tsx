'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingFormData } from './OnboardingWizard';

interface AvailabilityStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const DURATION_OPTIONS = ['1 hour', '2 hours', '3-4 hours', 'Half day (4-6 hours)', 'Full day (6+ hours)'];

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
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

  const getDayLabel = (dayValue: number) => {
    return DAYS_OF_WEEK.find((d) => d.value === dayValue)?.label || '';
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Set Your Availability</h2>
        <p className="text-gray-600">
          Define your weekly schedule when you're available to guide. You can update this later in your dashboard.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">⏰ Important Guidelines:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Most experiences are 3-4 hours long</li>
          <li>Time blocks must be at least 3 hours</li>
          <li>Be realistic - only set times you can consistently commit to</li>
          <li>You can specify exam periods and holidays in the notes below</li>
        </ul>
      </div>

      {/* Add Availability Form */}
      <div className="border rounded-lg p-6 space-y-4 bg-gray-50">
        <h3 className="font-bold text-lg">Add Time Slot</h3>

        {/* Day Selection */}
        <div className="space-y-2">
          <Label>Select Day</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => setSelectedDay(day.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDay === day.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-100'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>End Time</Label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Note */}
        <div className="space-y-2">
          <Label>Note (Optional)</Label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Not available during exam weeks in May"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <Button type="button" onClick={addAvailabilitySlot} className="w-full">
          Add Time Slot
        </Button>
      </div>

      {/* Current Availability */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Your Weekly Schedule</h3>
          <span className="text-sm text-gray-600">
            {formData.availability.length} slot{formData.availability.length !== 1 ? 's' : ''} added
          </span>
        </div>

        {formData.availability.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
            <p>No time slots added yet</p>
            <p className="text-sm mt-1">Add at least one time slot to continue</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilityByDay.map(
              (day) =>
                day.slots.length > 0 && (
                  <div key={day.value} className="border rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">{day.label}</h4>
                    <div className="space-y-2">
                      {day.slots.map((slot, index) => {
                        const globalIndex = formData.availability.indexOf(slot);
                        return (
                          <div
                            key={globalIndex}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded"
                          >
                            <div>
                              <p className="font-medium">
                                {slot.startTime} - {slot.endTime}
                                <span className="text-sm text-gray-600 ml-2">
                                  ({calculateDuration(slot.startTime, slot.endTime)})
                                </span>
                              </p>
                              {slot.note && (
                                <p className="text-sm text-gray-600 mt-1">Note: {slot.note}</p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeSlot(globalIndex)}
                            >
                              Remove
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
            )}
          </div>
        )}

        {errors.availability && <p className="text-sm text-red-500">{errors.availability}</p>}
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">
          Timezone <span className="text-red-500">*</span>
        </Label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) => updateFormData({ timezone: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg ${errors.timezone ? 'border-red-500' : ''}`}
        >
          {TIMEZONE_OPTIONS.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Your local timezone for scheduling guide sessions. Tourists will see availability times converted to their timezone.
        </p>
        {errors.timezone && <p className="text-sm text-red-500">{errors.timezone}</p>}
      </div>

      {/* Preferred Guide Durations */}
      <div className="space-y-3">
        <Label>
          Preferred Guide Durations <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">What session lengths do you prefer to offer?</p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => toggleDuration(duration)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                formData.preferredDurations.includes(duration)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-100'
              }`}
            >
              {duration}
            </button>
          ))}
        </div>
        {formData.preferredDurations.length > 0 && (
          <p className="text-sm text-green-700">
            Selected: {formData.preferredDurations.join(', ')}
          </p>
        )}
        {errors.preferredDurations && <p className="text-sm text-red-500">{errors.preferredDurations}</p>}
      </div>

      {/* One-Time Unavailability Exceptions */}
      <div className="space-y-4">
        <div>
          <Label>One-Time Unavailability (Optional)</Label>
          <p className="text-sm text-gray-600 mt-1">
            Add specific dates when you won't be available (e.g., exams, travel, holidays)
          </p>
        </div>

        <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <input
                type="date"
                value={exceptionDate}
                onChange={(e) => setExceptionDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <input
                type="text"
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                placeholder="e.g., Final exams"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <Button type="button" onClick={addException} variant="outline" className="w-full">
            Add Unavailable Date
          </Button>
        </div>

        {formData.unavailabilityExceptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Unavailable Dates ({formData.unavailabilityExceptions.length}):
            </p>
            <div className="space-y-2">
              {formData.unavailabilityExceptions.map((exception, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 p-3 rounded border"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(exception.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {exception.reason && (
                      <p className="text-sm text-gray-600">Reason: {exception.reason}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeException(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          💡 <strong>Tip:</strong> Start with a realistic schedule. You can always add more slots later
          as you get more comfortable. Quality experiences are better than overcommitting!
        </p>
      </div>
    </div>
  );
}
