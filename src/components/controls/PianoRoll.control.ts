import type { NoteEvent } from "../../types/protocol";
import { defineControl } from "../control-registry";
import component from "./PianoRoll.vue";

export default defineControl({
  kind: "piano_roll",
  component,
  layout: "wide",
  adapt: (control, { emit, planeId }) => ({
    control,
    planeId,
    onCreate: (note: Omit<NoteEvent, "id">) => emit("noteCreate", note),
    onUpdate: (note: NoteEvent) => emit("noteUpdate", note),
    onDelete: (id: number) => emit("noteDelete", id),
  }),
});
