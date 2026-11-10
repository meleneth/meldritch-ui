import { defineControl } from "../control-registry";
import component from "./AdsrControl.vue";

export default defineControl({
  kind: "adsr",
  component,
  layout: "wide",
  adapt: (control, { emit, planeId }) => ({
    control,
    planeId,
    onChange: (
      name: (typeof control.parameters)[number]["name"],
      value: number,
    ) => emit("adsr", name, value),
  }),
});
