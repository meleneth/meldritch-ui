import { defineControl } from "../control-registry";
import component from "./ToggleControl.vue";

export default defineControl({
  kind: "toggle",
  component,
  adapt: (control, { emit }) => ({
    control,
    onChange: (value: boolean) => emit("setToggle", control.id, value),
  }),
});
