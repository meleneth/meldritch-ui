import { defineControl } from "../control-registry";
import component from "./StepSequencer.vue";

export default defineControl({
  kind: "step_sequencer",
  component,
  adapt: (control, { emit }) => ({
    control,
    onToggle: (step: number) => emit("toggle", step),
  }),
});
