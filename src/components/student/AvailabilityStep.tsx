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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">Set Your Availability</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Define your weekly schedule when you're available to guide. You can update this later in your dashboard.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-300 rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl flex-shrink-0">
            ⏰
          </div>
          <h3 className="font-bold text-blue-900 text-lg">Important Guidelines</h3>
        </div>
        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside ml-1 leading-relaxed">
          <li>Most experiences are 3-4 hours long</li>
          <li>Time blocks must be at least 3 hours</li>
          <li>Be realistic - only set times you can consistently commit to</li>
          <li>You can specify exam periods and holidays in the notes below</li>
        </ul>
      </div>

      {/* Add Availability Form */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl">
            ➕
          </div>
          <h3 className="font-bold text-lg text-gray-900">Add Time Slot</h3>
        </div>

        {/* Day Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-gray-900">Select Day</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const daySlots = formData.availability.filter((slot) => slot.dayOfWeek === day.value);
              const hasSlots = daySlots.length > 0;
              const isSelected = selectedDay === day.value;

              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setSelectedDay(day.value)}
                  className={`relative px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                      : hasSlots
                      ? 'bg-white text-blue-700 border-2 border-blue-300 hover:border-blue-400 hover:shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <span className="text-sm sm:text-base">{day.label.substring(0, 3)}</span>
                  {hasSlots && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {daySlots.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedDay !== null && (
            <p className="text-sm text-blue-700 font-medium">
              Selected: {getDayLabel(selectedDay)}
            </p>
          )}
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Start Time</Label>
            <div className="relative">
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none cursor-pointer"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">End Time</Label>
            <div className="relative">
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none cursor-pointer"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Duration Preview */}
        {selectedDay !== null && (
          <div className="bg-white/60 backdrop-blur-sm border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Duration:</span>{' '}
              {calculateDuration(startTime, endTime)}
              {(() => {
                const start = startTime.split(':').map(Number);
                const end = endTime.split(':').map(Number);
                const minutes = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
                if (minutes < 180) {
                  return <span className="text-red-600 ml-2">⚠️ Must be at least 3 hours</span>;
                }
                return <span className="text-green-600 ml-2">✓ Valid duration</span>;
              })()}
            </p>
          </div>
        )}

        {/* Optional Note */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Note (Optional)</Label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Not available during exam weeks in May"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        <button
          type="button"
          onClick={addAvailabilitySlot}
          disabled={selectedDay === null}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {selectedDay === null ? 'Select a day first' : `Add time slot for ${getDayLabel(selectedDay)}`}
        </button>
      </div>

      {/* Current Availability */}
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xl text-gray-900">Your Weekly Schedule</h3>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {formData.availability.length} slot{formData.availability.length !== 1 ? 's' : ''}
          </span>
        </div>

        {formData.availability.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-gray-700 font-semibold">No time slots added yet</p>
            <p className="text-sm text-gray-600 mt-2">Add at least one time slot to continue</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availabilityByDay.map(
              (day) =>
                day.slots.length > 0 && (
                  <div key={day.value} className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-blue-700 mb-3 text-lg flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm">
                        {day.label.substring(0, 1)}
                      </span>
                      {day.label}
                    </h4>
                    <div className="space-y-3">
                      {day.slots.map((slot, index) => {
                        const globalIndex = formData.availability.indexOf(slot);
                        return (
                          <div
                            key={globalIndex}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl gap-3"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {slot.startTime} - {slot.endTime}
                                <span className="text-sm text-blue-600 ml-2 font-normal">
                                  ({calculateDuration(slot.startTime, slot.endTime)})
                                </span>
                              </p>
                              {slot.note && (
                                <p className="text-sm text-gray-700 mt-1 italic">
                                  <span className="font-semibold">Note:</span> {slot.note}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSlot(globalIndex)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
            )}
          </div>
        )}

        {errors.availability && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.availability}
          </p>
        )}
      </div>

      {/* Timezone */}
      <div className="space-y-3">
        <Label htmlFor="timezone" className="text-xl font-bold text-gray-900">
          Timezone <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <select
            id="timezone"
            value={formData.timezone}
            onChange={(e) => updateFormData({ timezone: e.target.value })}
            className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-200 transition-all appearance-none cursor-pointer ${
              errors.timezone ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-blue-500'
            }`}
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Your local timezone for scheduling guide sessions. Tourists will see availability times converted to their timezone.
        </p>
        {errors.timezone && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.timezone}
          </p>
        )}
      </div>

      {/* Preferred Guide Durations */}
      <div className="space-y-4">
        <div>
          <Label className="text-xl font-bold text-gray-900">
            Preferred Guide Durations <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600 mt-2">What session lengths do you prefer to offer? Select all that apply.</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-2 inline-flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((duration, index) => {
            const isSelected = formData.preferredDurations.includes(duration);
            return (
              <button
                key={duration}
                type="button"
                onClick={() => toggleDuration(duration)}
                className={`relative px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-102'
                }`}
              >
                {duration}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {formData.preferredDurations.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {formData.preferredDurations.length} duration{formData.preferredDurations.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {errors.preferredDurations && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.preferredDurations}
          </p>
        )}
      </div>

      {/* One-Time Unavailability Exceptions */}
      <div className="space-y-5">
        <div>
          <Label className="text-xl font-bold text-gray-900">One-Time Unavailability (Optional)</Label>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Add specific dates when you won't be available (e.g., exams, travel, holidays)
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-200 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Date</Label>
              <input
                type="date"
                value={exceptionDate}
                onChange={(e) => setExceptionDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Reason (Optional)</Label>
              <input
                type="text"
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                placeholder="e.g., Final exams"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addException}
            disabled={!exceptionDate}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Unavailable Date
          </button>
        </div>

        {formData.unavailabilityExceptions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                Unavailable Dates:
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                {formData.unavailabilityExceptions.length}
              </span>
            </div>
            <div className="space-y-3">
              {formData.unavailabilityExceptions.map((exception, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border-2 border-amber-200 p-4 rounded-xl gap-3"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {new Date(exception.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {exception.reason && (
                      <p className="text-sm text-gray-700 mt-1 italic">
                        <span className="font-semibold">Reason:</span> {exception.reason}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeException(index)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xl flex-shrink-0">
            💡
          </div>
          <p className="text-sm text-green-800 leading-relaxed">
            <strong>Tip:</strong> Start with a realistic schedule. You can always add more slots later
            as you get more comfortable. Quality experiences are better than overcommitting!
          </p>
        </div>
      </div>
    </div>
  );
}
