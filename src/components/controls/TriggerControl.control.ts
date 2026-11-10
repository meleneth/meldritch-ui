import { defineControl } from "../control-registry";
import component from "./TriggerControl.vue";

export default defineControl({
  kind: "trigger",
  component,
  adapt: (control, { emit }) => ({
    control,
    onFire: () => emit("fire"),
  }),
});
