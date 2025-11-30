'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Plus, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  available: boolean;
  slots: TimeSlot[];
}

interface AvailabilityEditorProps {
  value: any; // JSON availability data from database
  onChange: (availability: DayAvailability[]) => void;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_OPTIONS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '23:59',
];

/**
 * AvailabilityEditor Component
 *
 * Allows students to edit their weekly availability by:
 * - Toggling days on/off
 * - Adding multiple time slots per day
 * - Removing time slots
 *
 * Data format: Array of DayAvailability objects
 */
export const AvailabilityEditor: React.FC<AvailabilityEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);

  // Initialize availability from prop value
  useEffect(() => {
    if (value && Array.isArray(value)) {
      setAvailability(value);
    } else {
      // Initialize with default structure
      const defaultAvailability: DayAvailability[] = DAYS_OF_WEEK.map(day => ({
        day,
        available: false,
        slots: [],
      }));
      setAvailability(defaultAvailability);
    }
  }, [value]);

  // Notify parent of changes
  useEffect(() => {
    if (availability.length > 0) {
      onChange(availability);
    }
  }, [availability]);

  const toggleDayAvailability = (dayIndex: number) => {
    const updated = [...availability];
    updated[dayIndex].available = !updated[dayIndex].available;

    // If disabling, clear slots
    if (!updated[dayIndex].available) {
      updated[dayIndex].slots = [];
    } else if (updated[dayIndex].slots.length === 0) {
      // If enabling and no slots, add default slot
      updated[dayIndex].slots = [{ start: '09:00', end: '17:00' }];
    }

    setAvailability(updated);
  };

  const addTimeSlot = (dayIndex: number) => {
    const updated = [...availability];
    const lastSlot = updated[dayIndex].slots[updated[dayIndex].slots.length - 1];
    const newStart = lastSlot ? lastSlot.end : '09:00';
    const newEnd = '17:00';

    updated[dayIndex].slots.push({ start: newStart, end: newEnd });
    setAvailability(updated);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...availability];
    updated[dayIndex].slots.splice(slotIndex, 1);

    // If no slots left, disable the day
    if (updated[dayIndex].slots.length === 0) {
      updated[dayIndex].available = false;
    }

    setAvailability(updated);
  };

  const updateTimeSlot = (
    dayIndex: number,
    slotIndex: number,
    field: 'start' | 'end',
    value: string
  ) => {
    const updated = [...availability];
    updated[dayIndex].slots[slotIndex][field] = value;
    setAvailability(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-ui-blue-primary/5 rounded-lg border border-ui-blue-primary/10">
        <Info className="w-5 h-5 text-ui-blue-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-gray-900 mb-1">Set Your Availability</p>
          <p className="text-gray-600">
            Toggle days you're available and specify time slots. You can add multiple time slots per day.
          </p>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {availability.map((dayAvail, dayIndex) => (
          <motion.div
            key={dayAvail.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.05 }}
            className={`border rounded-lg p-4 transition-all ${
              dayAvail.available
                ? 'border-ui-blue-primary bg-ui-blue-primary/5'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={dayAvail.available}
                  onCheckedChange={() => toggleDayAvailability(dayIndex)}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={`day-${dayIndex}`}
                  className={`text-base font-medium cursor-pointer ${
                    dayAvail.available ? 'text-ui-blue-primary' : 'text-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {dayAvail.day}
                </Label>
              </div>

              {dayAvail.available && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addTimeSlot(dayIndex)}
                  disabled={disabled}
                  className="text-ui-blue-primary hover:text-ui-blue-secondary"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Slot
                </Button>
              )}
            </div>

            {/* Time Slots */}
            {dayAvail.available && dayAvail.slots.length > 0 && (
              <div className="space-y-2 ml-7">
                {dayAvail.slots.map((slot, slotIndex) => (
                  <motion.div
                    key={slotIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />

                    {/* Start Time */}
                    <select
                      value={slot.start}
                      onChange={(e) =>
                        updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)
                      }
                      disabled={disabled}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-ui-blue-primary focus:border-ui-blue-primary"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <span className="text-gray-500 font-medium">to</span>

                    {/* End Time */}
                    <select
                      value={slot.end}
                      onChange={(e) =>
                        updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)
                      }
                      disabled={disabled}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-ui-blue-primary focus:border-ui-blue-primary"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    {/* Remove Button */}
                    {dayAvail.slots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                        disabled={disabled}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">
            {availability.filter(d => d.available).length}
          </span>{' '}
          days available •{' '}
          <span className="font-medium text-gray-900">
            {availability.reduce((acc, d) => acc + d.slots.length, 0)}
          </span>{' '}
          total time slots
        </p>
      </div>
    </div>
  );
};

export default AvailabilityEditor;
