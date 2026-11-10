<script setup lang="ts">
import { computed } from "vue";
import type { ControlDefinition } from "../types/protocol";
import { resolveControl, type ControlRendererEvents } from "./control-registry";

const props = defineProps<{ control: ControlDefinition; planeId?: string }>();
const emit = defineEmits<ControlRendererEvents>();
const resolved = computed(() =>
  resolveControl(props.control, {
    planeId: props.planeId ?? "unknown",
    emit,
  }),
);
</script>

<template>
  <div
    v-if="resolved"
    class="control-renderer"
    :data-control-layout="resolved.layout"
  >
    <component :is="resolved.component" v-bind="resolved.props" />
  </div>
</template>
