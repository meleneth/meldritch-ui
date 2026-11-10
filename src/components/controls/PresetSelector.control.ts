import { defineControl } from "../control-registry";
import component from "./PresetSelector.vue";

export default defineControl({
  kind: "preset_selector",
  component,
  layout: "wide",
  adapt: (control, { emit }) => ({
    control,
    onSelect: (preset: string) => emit("preset", preset),
  }),
});
