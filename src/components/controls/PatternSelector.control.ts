import { defineControl } from "../control-registry";
import component from "./PatternSelector.vue";

export default defineControl({
  kind: "pattern_selector",
  component,
  layout: "wide",
  adapt: (control, { emit }) => ({
    control,
    onSelect: (pattern: number, boundary: typeof control.boundary) =>
      emit("pattern", pattern, boundary),
  }),
});
