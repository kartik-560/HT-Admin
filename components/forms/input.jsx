
import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(
  ({ className, type, label, error, name, blockDigits = false, numericOnly = false, phoneMode = false, ...props }, ref) => {
    const makeEvent = (value) => ({
      target: { name: name ?? props.name ?? '', value },
    });

    // helper to decide allowed chars
    const sanitizeForPhone = (raw) => {
      if (numericOnly) {
        // remove everything that's not a digit
        return String(raw ?? '').replace(/\D/g, '');
      }
      if (phoneMode) {
        // allow leading +, remove other non-digits
        // keep a single leading + if present
        let s = String(raw ?? '');
        // remove spaces, dashes, parentheses, letters
        s = s.replace(/[^\d+]/g, '');
        // if multiple + signs, keep only the first and only if at start
        const plusCount = (s.match(/\+/g) || []).length;
        if (plusCount > 1) {
          s = s.replace(/\+/g, '');
          s = '+' + s;
        } else if (plusCount === 1 && s[0] !== '+') {
          // move + to front
          s = '+' + s.replace(/\+/g, '');
        }
        // finally remove any non-digit/+ just in case
        return s.replace(/(?!^\+)[^\d]/g, '');
      }
      // blockDigits fallback: remove digits if blockDigits true
      if (blockDigits) return String(raw ?? '').replace(/\d/g, '');
      return raw;
    };

    const onKeyDown = (e) => {
      // allow control combos
      if (e.ctrlKey || e.metaKey || e.altKey) {
        props.onKeyDown?.(e);
        return;
      }

      // if numericOnly: block any non-digit
      if (numericOnly) {
        if (!/^\d$/.test(e.key) && e.key.length === 1) {
          e.preventDefault();
          return;
        }
      }

      // if phoneMode: allow digits and + only (plus only at first position)
      if (phoneMode) {
        const isDigit = /^\d$/.test(e.key);
        const isPlus = e.key === '+';
        if (e.key.length === 1 && !isDigit && !isPlus) {
          e.preventDefault();
          return;
        }
        if (isPlus) {
          const el = e.target;
          // if caret not at start or there is already a +, block
          const alreadyPlus = (el.value || '').includes('+');
          const caretAtStart = (el.selectionStart ?? 0) === 0;
          if (alreadyPlus || !caretAtStart) {
            e.preventDefault();
            return;
          }
        }
      }

      // blockDigits behavior
      if (blockDigits && /^\d$/.test(e.key)) {
        e.preventDefault();
        return;
      }

      props.onKeyDown?.(e);
    };

    const onPaste = (e) => {
      const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
      if (!paste) {
        props.onPaste?.(e);
        return;
      }

      // sanitize pasted value according to mode
      const filtered = sanitizeForPhone(paste);

      if (filtered !== paste) {
        e.preventDefault();
        const el = e.target;
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        const newVal = el.value.slice(0, start) + filtered + el.value.slice(end);

        if (props.onChange) {
          props.onChange(makeEvent(newVal));
        } else {
          el.value = newVal;
          el.setSelectionRange(start + filtered.length, start + filtered.length);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }

      props.onPaste?.(e);
    };

    const onChange = (e) => {
      // If parent passed a value event, sanitize it; else forward original event
      // e may be an Event or direct value (defensive)
      const raw = typeof e === 'string' ? e : (e?.target?.value ?? '');
      // If neither numericOnly nor phoneMode nor blockDigits, forward directly
      if (!numericOnly && !phoneMode && !blockDigits) {
        props.onChange?.(e);
        return;
      }

      const filtered = sanitizeForPhone(raw);

      if (props.onChange) {
        props.onChange(makeEvent(filtered));
      }
    };

    // Helpful attributes for phone inputs
    const inputProps = {
      inputMode: phoneMode || numericOnly ? 'tel' : undefined,
      autoComplete: phoneMode || numericOnly ? 'tel' : undefined,
      ...props,
    };

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        )}
        <input
          type={type}
          name={name ?? props.name}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          {...inputProps}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onChange={onChange}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

const Select = React.forwardRef(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

const Textarea = React.forwardRef(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Input, Select, Textarea };
