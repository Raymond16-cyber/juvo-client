import api, { getApiErrorMessage } from "@/lib/axios";

export type TranscriptionResponse = {
  success: boolean;
  message: string;
  data: {
    text: string;
    provider: "xai" | "gemini";
    model: string;
    language: string | null;
  };
};

export async function transcribeAudioService(audio: Blob) {
  const formData = new FormData();
  const extension = audio.type.includes("mp4")
    ? "mp4"
    : audio.type.includes("wav")
      ? "wav"
      : "webm";
  formData.append("audio", audio, `voice-note.${extension}`);

  try {
    const response = await api.post<TranscriptionResponse>(
      "/ai/transcribe",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 90000,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Unable to transcribe this voice note."),
    );
  }
}
