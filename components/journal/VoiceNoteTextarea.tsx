"use client";

import { textareaClassName, cn } from "@/lib/ui";
import { transcribeAudioService } from "@/services/transcription.service";
import { LoaderCircle, Mic, Square } from "lucide-react";
import {
  ChangeEvent,
  TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";

type VoiceNoteTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
  textareaClassNameOverride?: string;
  /** When true, keep the recorded blob available through onAudioChange. */
  captureAudio?: boolean;
  onAudioChange?: (blob: Blob | null) => void;
  /** Append spoken text to the current value instead of replacing it. */
  append?: boolean;
  onBusyChange?: (busy: boolean) => void;
};

function mergeTranscript(existing: string, incoming: string, append: boolean) {
  const next = incoming.trim();
  if (!next) return existing;
  if (!append || !existing.trim()) return next;
  const needsSpace = !/\s$/.test(existing);
  return `${existing.trimEnd()}${needsSpace ? " " : ""}${next}`;
}

export default function VoiceNoteTextarea({
  value,
  onChange,
  label,
  helperText,
  className,
  textareaClassNameOverride,
  captureAudio = false,
  onAudioChange,
  append = true,
  onBusyChange,
  disabled,
  id,
  ...textareaProps
}: VoiceNoteTextareaProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onBusyChange?.(isRecording || isTranscribing);
  }, [isRecording, isTranscribing, onBusyChange]);

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // Recorder may already be inactive.
      }
    };
  }, []);

  const stopTracks = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const finishRecording = async (blob: Blob) => {
    setIsRecording(false);
    stopTracks();

    if (captureAudio) {
      onAudioChange?.(blob);
    }

    setIsTranscribing(true);
    setError(null);
    try {
      const result = await transcribeAudioService(blob);
      onChange(mergeTranscript(valueRef.current, result.data.text, append));
    } catch (transcriptionError) {
      setError(
        transcriptionError instanceof Error
          ? transcriptionError.message
          : "Unable to transcribe this voice note.",
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Voice notes are not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const preferredMimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        void finishRecording(blob);
      };

      recorder.start();
      setIsRecording(true);
      if (captureAudio) {
        onAudioChange?.(null);
      }
    } catch {
      setError(
        "Unable to access your microphone. Check browser permissions and try again.",
      );
      stopTracks();
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }
    setIsRecording(false);
    stopTracks();
  };

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const busy = Boolean(disabled || isTranscribing);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={busy}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50",
              isRecording
                ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300"
                : "border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200",
            )}
            aria-pressed={isRecording}
          >
            {isTranscribing ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : isRecording ? (
              <Square size={14} />
            ) : (
              <Mic size={14} />
            )}
            {isTranscribing
              ? "Transcribing…"
              : isRecording
                ? "Stop"
                : "Speak"}
          </button>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={busy}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50",
              isRecording
                ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300"
                : "border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200",
            )}
            aria-pressed={isRecording}
          >
            {isTranscribing ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : isRecording ? (
              <Square size={14} />
            ) : (
              <Mic size={14} />
            )}
            {isTranscribing
              ? "Transcribing…"
              : isRecording
                ? "Stop"
                : "Speak"}
          </button>
        </div>
      )}

      <div className="relative">
        <textarea
          {...textareaProps}
          id={id}
          value={value}
          disabled={busy}
          onChange={handleTextChange}
          className={cn(
            textareaClassNameOverride || textareaClassName,
            "pr-3",
          )}
        />
      </div>

      {isRecording ? (
        <p className="text-xs text-rose-600 dark:text-rose-300" aria-live="polite">
          Listening… speak naturally, then stop when finished.
        </p>
      ) : null}
      {isTranscribing ? (
        <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
          Turning your voice note into clear text…
        </p>
      ) : null}
      {helperText && !error && !isRecording && !isTranscribing ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
