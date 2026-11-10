import { defineControl } from "../control-registry";
import component from "./KnobControl.vue";

export default defineControl({
  kind: "knob",
  component,
  adapt: (control, { emit }) => ({
    control,
    onChange: (value: number) => emit("set", control.id, value),
  }),
});
