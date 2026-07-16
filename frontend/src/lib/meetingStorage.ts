// ── Meeting Storage — camada de persistência de reuniões ──────────────────────
// Hoje: localStorage (funciona offline, sem backend).
// Futuro: trocar save/load/remove por chamadas Supabase sem alterar a UI.

import type { MeetingResult } from './meetingService';

export interface SavedMeeting {
  id: string;
  title: string;           // primeiros 80 chars da transcrição ou título manual
  savedAt: string;         // ISO string
  transcript: string;
  result: MeetingResult;
}

const STORAGE_KEY = 'imkt_reunioes';

function load(): SavedMeeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedMeeting[]) : [];
  } catch {
    return [];
  }
}

function persist(meetings: SavedMeeting[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
}

export function listMeetings(): SavedMeeting[] {
  return load().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveMeeting(transcript: string, result: MeetingResult, title?: string): SavedMeeting {
  const meetings = load();
  const entry: SavedMeeting = {
    id: `meet_${Date.now()}`,
    title: title?.trim() || transcript.trim().slice(0, 80).replace(/\n/g, ' ') + '…',
    savedAt: new Date().toISOString(),
    transcript,
    result,
  };
  persist([entry, ...meetings]);
  return entry;
}

export function deleteMeeting(id: string): void {
  persist(load().filter(m => m.id !== id));
}
