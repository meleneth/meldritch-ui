import type {
  AccessLink as ContractAccessLink,
  AdsrParameter as ContractAdsrParameter,
  AudioTelemetry as ContractAudioTelemetry,
  Authenticate,
  ClientMessage,
  Hello,
  NoteEvent as ContractNoteEvent,
  ProjectedState,
  StateSnapshot,
  StateUpdated,
} from "../generated/protocol";

export type Scale = "linear" | "log";
export interface BaseControl {
  id: string;
  label: string;
  kind: string;
  unit?: string;
  read_only?: boolean;
}
export interface RangeControl extends BaseControl {
  kind: "fader" | "knob";
  min: number;
  max: number;
  scale: Scale;
  value: number;
}
export interface ToggleControl extends BaseControl {
  kind: "toggle";
  value: boolean;
}
export interface StepControl extends BaseControl {
  kind: "step_sequencer";
  step_count: number;
  steps: boolean[];
  position: number | null;
}
export interface TriggerControl extends BaseControl {
  kind: "trigger";
  serial: number;
}
export interface DrumHit {
  id: number;
  step: number;
  velocity: number;
  duration: number;
}
export interface DrumRowDefinition {
  id: string;
  label: string;
  note: number;
}
export interface DrumRowState {
  id: string;
  muted: boolean;
  hits: DrumHit[];
}
export interface DrumGridControl extends BaseControl {
  kind: "drum_grid";
  kit: string;
  current_kit: string;
  step_count: number;
  rows: DrumRowDefinition[];
  pattern: number;
  state_rows: DrumRowState[];
  position: number | null;
}
export type NoteEvent = ContractNoteEvent;
export interface PianoRollControl extends BaseControl {
  kind: "piano_roll";
  step_count: number;
  pitch_min: number;
  pitch_max: number;
  voices: number;
  pattern: number;
  notes: NoteEvent[];
  position: number | null;
}
export type AdsrParameter = ContractAdsrParameter;
export interface AdsrControl extends BaseControl {
  kind: "adsr";
  parameters: AdsrParameter[];
  values: Record<string, number>;
}
export interface PatternControl extends BaseControl {
  kind: "pattern_selector";
  patterns: string[];
  boundaries: Array<"immediate" | "beat" | "bar" | "cycle">;
  default_boundary: "immediate" | "beat" | "bar" | "cycle";
  active: number;
  active_name?: string;
  pending: number | null;
  pending_name?: string | null;
  boundary: "immediate" | "beat" | "bar" | "cycle";
}
export interface PresetControl extends BaseControl {
  kind: "preset_selector";
  presets: string[];
  entries: Array<{ id: string; name: string; bank: string; category: string }>;
  active: number;
  active_name?: string;
  pending: number | null;
  failed: string | null;
}
export type ControlDefinition =
  | RangeControl
  | ToggleControl
  | StepControl
  | TriggerControl
  | DrumGridControl
  | PianoRollControl
  | AdsrControl
  | PatternControl
  | PresetControl;
export interface Plane {
  id: string;
  label: string;
  layout?: string;
  roles?: string[];
  read_only?: boolean;
  controls: ControlDefinition[];
}
export type AudioTelemetry = ContractAudioTelemetry;
export type AccessLink = ContractAccessLink;
interface UiProjectedState {
  name: ProjectedState["name"];
  role?: ProjectedState["role"];
  planes?: Plane[];
  values: ProjectedState["values"];
  controls?: ProjectedState["controls"];
  audio?: ProjectedState["audio"];
  [key: string]: unknown;
}
export type Snapshot = (
  | Omit<StateSnapshot, "state">
  | Omit<StateUpdated, "state">
) & {
  state: UiProjectedState;
};
export type Command = Exclude<ClientMessage, Hello | Authenticate>;
