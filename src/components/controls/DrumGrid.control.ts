import { defineControl } from "../control-registry";
import component from "./DrumGrid.vue";

export default defineControl({
  kind: "drum_grid",
  component,
  layout: "wide",
  adapt: (control, { emit }) => ({
    control,
    onToggle: (row: string, step: number) => emit("drumToggle", row, step),
    onVelocity: (row: string, step: number, velocity: number) =>
      emit("drumVelocity", row, step, velocity),
    onMute: (row: string, muted: boolean) => emit("drumMute", row, muted),
  }),
});
