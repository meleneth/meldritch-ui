import { defineControl } from "../control-registry";
import component from "./FaderControl.vue";

export default defineControl({
  kind: "fader",
  component,
  adapt: (control, { emit }) => ({
    control,
    onChange: (value: number) => emit("set", control.id, value),
  }),
});
