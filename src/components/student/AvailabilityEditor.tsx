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

// Database model from Prisma
interface StudentAvailability {
  id?: string;
  studentId?: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  note?: string;
}

interface AvailabilityEditorProps {
  value: any; // Can be StudentAvailability[] from database or DayAvailability[] from UI
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
 * Convert database StudentAvailability[] to UI DayAvailability[]
 */
function convertFromDatabase(dbAvailability: StudentAvailability[]): DayAvailability[] {
  const result: DayAvailability[] = DAYS_OF_WEEK.map((day, index) => ({
    day,
    available: false,
    slots: [],
  }));

  if (!dbAvailability || dbAvailability.length === 0) {
    return result;
  }

  dbAvailability.forEach((item) => {
    // Convert dayOfWeek (0=Sunday) to our index (0=Monday)
    // Database: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Our array: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    let dayIndex = item.dayOfWeek - 1;
    if (dayIndex < 0) dayIndex = 6; // Sunday wraps to end

    if (dayIndex >= 0 && dayIndex < 7) {
      result[dayIndex].available = true;
      result[dayIndex].slots.push({
        start: item.startTime,
        end: item.endTime,
      });
    }
  });

  return result;
}

/**
 * Check if value is database format (StudentAvailability[])
 */
function isDatabaseFormat(value: any): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  const first = value[0];
  return (
    first !== null &&
    typeof first === 'object' &&
    'dayOfWeek' in first &&
    'startTime' in first &&
    'endTime' in first
  );
}

/**
 * Check if value is UI format (DayAvailability[])
 */
function isUIFormat(value: any): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  const first = value[0];
  return (
    first !== null &&
    typeof first === 'object' &&
    'day' in first &&
    'available' in first &&
    'slots' in first
  );
}

/**
 * AvailabilityEditor Component
 *
 * Allows students to edit their weekly availability by:
 * - Toggling days on/off
 * - Adding multiple time slots per day
 * - Removing time slots
 *
 * Data format: Array of DayAvailability objects
 * Handles conversion from database StudentAvailability[] format
 */
export const AvailabilityEditor: React.FC<AvailabilityEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize availability from prop value
  useEffect(() => {
    let initialAvailability: DayAvailability[];

    if (isDatabaseFormat(value)) {
      // Convert from database format
      initialAvailability = convertFromDatabase(value as StudentAvailability[]);
    } else if (isUIFormat(value)) {
      // Already in UI format
      initialAvailability = value as DayAvailability[];
    } else {
      // Initialize with default structure
      initialAvailability = DAYS_OF_WEEK.map(day => ({
        day,
        available: false,
        slots: [],
      }));
    }

    setAvailability(initialAvailability);
    // Mark as initialized after a brief delay to prevent initial onChange call
    setTimeout(() => setIsInitialized(true), 0);
  }, [value]);

  // Notify parent of changes (only when user actively edits, not during initialization)
  useEffect(() => {
    // Only call onChange when:
    // 1. Component is initialized (not first render)
    // 2. Availability has data
    // 3. Not in disabled/read-only mode
    if (isInitialized && availability.length > 0 && !disabled) {
      onChange(availability);
    }
  }, [availability, isInitialized, disabled, onChange]);

  const toggleDayAvailability = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex) return day;

        const newAvailable = !day.available;
        let newSlots = day.slots;

        // If enabling and no slots, add default slot. If disabling, clear slots.
        if (newAvailable && day.slots.length === 0) {
          newSlots = [{ start: '09:00', end: '17:00' }];
        } else if (!newAvailable) {
          newSlots = [];
        }

        return {
          ...day,
          available: newAvailable,
          slots: newSlots,
        };
      })
    );
  };

  const addTimeSlot = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex) return day;

        const lastSlot = day.slots[day.slots.length - 1];
        const newStart = lastSlot ? lastSlot.end : '09:00';
        const newEnd = '17:00';

        return {
          ...day,
          slots: [...day.slots, { start: newStart, end: newEnd }],
        };
      })
    );
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    setAvailability((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex) return day;

        const newSlots = day.slots.filter((_, sIndex) => sIndex !== slotIndex);
        const newAvailable = newSlots.length > 0; // If no slots left, disable day

        return {
          ...day,
          slots: newSlots,
          available: day.available && newSlots.length === 0 ? false : day.available,
        };
      })
    );
  };

  const updateTimeSlot = (
    dayIndex: number,
    slotIndex: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setAvailability((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex) return day;

        return {
          ...day,
          slots: day.slots.map((slot, sIndex) => {
            if (sIndex !== slotIndex) return slot;
            return { ...slot, [field]: value };
          }),
        };
      })
    );
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
            className={`border rounded-lg p-4 transition-all ${dayAvail.available
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
                  className={`text-base font-medium cursor-pointer ${dayAvail.available ? 'text-ui-blue-primary' : 'text-gray-700'
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
