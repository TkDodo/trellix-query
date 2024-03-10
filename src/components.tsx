import { forwardRef, useRef, useState } from "react";
import { flushSync } from "react-dom";

export const SaveButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      ref={ref}
      // this makes it so the button takes focus on clicks in safari I can't
      // remember if this is the proper workaround or not, it's been a while!
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#clicking_and_focus
      // https://bugs.webkit.org/show_bug.cgi?id=22261
      tabIndex={0}
      {...props}
      className="text-sm rounded-lg text-left p-2 font-medium text-white bg-brand-blue"
    />
  );
});

export const CancelButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      tabIndex={0}
      {...props}
      className="text-sm rounded-lg text-left p-2 font-medium hover:bg-slate-200 focus:bg-slate-200"
    />
  );
});

export function EditableText({
  fieldName,
  value,
  inputClassName,
  inputLabel,
  buttonClassName,
  buttonLabel,
  onSubmit,
}: {
  fieldName: string;
  value: string;
  inputClassName: string;
  inputLabel: string;
  buttonClassName: string;
  buttonLabel: string;
  onSubmit: (newName: string) => void;
}) {
  const [edit, setEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return edit ? (
    <form
      onSubmit={() => {
        onSubmit(inputRef.current?.value ?? "");
        flushSync(() => {
          setEdit(false);
        });
        buttonRef.current?.focus();
      }}
    >
      <input
        required
        ref={inputRef}
        type="text"
        aria-label={inputLabel}
        name={fieldName}
        defaultValue={value}
        className={inputClassName}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            flushSync(() => {
              setEdit(false);
            });
            buttonRef.current?.focus();
          }
        }}
        onBlur={() => {
          if (
            inputRef.current?.value !== value &&
            inputRef.current?.value.trim() !== ""
          ) {
            onSubmit(inputRef.current?.value ?? "");
          }
          setEdit(false);
        }}
      />
    </form>
  ) : (
    <button
      aria-label={buttonLabel}
      type="button"
      ref={buttonRef}
      onClick={() => {
        flushSync(() => {
          setEdit(true);
        });
        inputRef.current?.select();
      }}
      className={buttonClassName}
    >
      {value || <span className="text-slate-400 italic">Edit</span>}
    </button>
  );
}
