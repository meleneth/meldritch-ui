import type { Component } from "vue";
import type {
  AdsrParameter,
  ControlDefinition,
  NoteEvent,
  PatternControl,
} from "../types/protocol";

export interface ControlRendererEvents {
  set: [string, number];
  setToggle: [string, boolean];
  adsr: [AdsrParameter["name"], number];
  toggle: [number];
  fire: [];
  noteCreate: [Omit<NoteEvent, "id">];
  noteUpdate: [NoteEvent];
  noteDelete: [number];
  pattern: [number, PatternControl["boundary"]];
  preset: [number | string];
  drumToggle: [string, number];
  drumVelocity: [string, number, number];
  drumMute: [string, boolean];
}

export type ControlRendererEmit = <Event extends keyof ControlRendererEvents>(
  event: Event,
  ...args: ControlRendererEvents[Event]
) => void;

type ControlKind = ControlDefinition["kind"];
type ControlOfKind<Kind extends ControlKind> = ControlDefinition & {
  kind: Kind;
};
type ComponentInputs<ControlComponent extends Component> =
  ControlComponent extends new (...args: never[]) => {
    $props: infer Inputs extends object;
  }
    ? Inputs
    : never;
export type ControlLayout = "compact" | "wide";

export interface ControlAdapterContext {
  planeId: string;
  emit: ControlRendererEmit;
}

interface ControlRegistration {
  readonly kind: ControlKind;
  readonly component: Component;
  readonly layout: ControlLayout;
  bind(
    control: ControlDefinition,
    context: ControlAdapterContext,
  ): object | undefined;
}

interface ControlRegistrationModule {
  default: ControlRegistration;
}

export interface ResolvedControl {
  component: Component;
  layout: ControlLayout;
  props: object;
}

function isControlOfKind<Kind extends ControlKind>(
  control: ControlDefinition,
  kind: Kind,
): control is ControlOfKind<Kind> {
  return control.kind === kind;
}

export function defineControl<
  Kind extends ControlKind,
  ControlComponent extends Component,
>(definition: {
  kind: Kind;
  component: ControlComponent;
  layout?: ControlLayout;
  adapt: (
    control: ControlOfKind<Kind>,
    context: ControlAdapterContext,
  ) => ComponentInputs<ControlComponent>;
}): ControlRegistration {
  return {
    kind: definition.kind,
    component: definition.component,
    layout: definition.layout ?? "compact",
    bind(control, context) {
      return isControlOfKind(control, definition.kind)
        ? definition.adapt(control, context)
        : undefined;
    },
  };
}

const discovered = import.meta.glob<ControlRegistrationModule>(
  "./controls/*.control.ts",
  { eager: true },
);

const controls = new Map<ControlKind, ControlRegistration>();
for (const [path, module] of Object.entries(discovered).sort(([a], [b]) =>
  a.localeCompare(b),
)) {
  const registration = module.default;
  if (controls.has(registration.kind))
    throw new Error(
      `Duplicate control registration for ${registration.kind} (${path})`,
    );
  controls.set(registration.kind, registration);
}

export function resolveControl(
  control: ControlDefinition,
  context: ControlAdapterContext,
): ResolvedControl | undefined {
  const registration = controls.get(control.kind);
  const props = registration?.bind(control, context);
  return registration && props
    ? {
        component: registration.component,
        layout: registration.layout,
        props,
      }
    : undefined;
}
