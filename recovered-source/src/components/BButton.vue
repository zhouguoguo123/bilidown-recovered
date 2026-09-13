<!--
  BButton — reconstructed from app.asar (Bilidown v1.2.7)
  <template> was decompiled from the compiled render function;
  <script> is the original component options object (identifiers restored).
-->
<template>
<button draggable="false" :class="['b-button--default', [type ? 'b-button--' + type : '', size ? 'b-button--' + size : '', {
  'is-round': round,
  'is-plain': plain
}]]" @click="handleClick">
  <i v-if="leftIcon" :class="['b-button-left-icon', leftIcon]" />
  <span>
    <slot>
      你好，新UI
    </slot>
  </span>
  <i v-if="rightIcon" :class="['b-button-right-icon', rightIcon]" />
</button>
</template>

<script>
export default {
  install(Vue) {
    Vue.component(this.name, this);
  },
  name: "BButton",
  props: {
    round: Boolean,
    plain: Boolean,
    size: String,
    leftIcon: {
      type: String,
      default: ""
    },
    rightIcon: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: "default"
    }
  },
  methods: {
    handleClick() {
      this.$emit("click");
    }
  }
};
</script>


<!-- @restored:style:START -->
<style scoped>
.b-button--default {
  padding:8px 14px;
  border-radius:6px;
  outline:none;
  font-size:14px;
  border:1.5px solid var(--default-btn-border);
  background:var(--default-btn-bg);
  color:var(--default-btn);
  -webkit-user-select:none;
  -moz-user-select:none;
  user-select:none;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:color .15s,background .15s,border-color .15s
}
.b-button--default:hover {
  border-color:var(--default-btn-border-hover);
  background:var(--default-btn-bg-hover);
  color:var(--default-btn-hover)
}
.b-button--default:active {
  border-color:var(--default-btn-border-active);
  background:var(--default-btn-bg-active);
  color:var(--default-btn-active)
}
.b-button--default.is-plain:hover {
  border-color:var(--default-btn-plain-border-hover);
  background:var(--default-btn-plain-bg-hover);
  color:var(--default-btn-plain-hover)
}
.b-button--default.is-plain:active {
  border-color:var(--default-btn-plain-border-active);
  background:var(--default-btn-plain-bg-active);
  color:var(--default-btn-plain-active)
}
.is-round {
  border-radius:980px
}
.b-button-left-icon {
  margin-right:3px
}
.b-button-right-icon {
  margin-left:3px
}
.b-button--middle {
  padding:6px 12px
}
.b-button--small {
  padding:6px 12px;
  font-size:12px
}
.b-button--mini {
  padding:4px 8px;
  font-size:12px
}
.b-button--minimini {
  padding:2px 8px;
  font-size:11px
}
.b-button--primary {
  border-color:var(--primary-btn-border);
  background:var(--primary-btn-bg);
  color:var(--primary-btn)
}
.b-button--primary:hover {
  border-color:var(--primary-btn-border-hover);
  background:var(--primary-btn-bg-hover);
  color:var(--primary-btn-hover)
}
.b-button--primary:active {
  border-color:var(--primary-btn-border-active);
  background:var(--primary-btn-bg-active);
  color:var(--primary-btn-active)
}
.b-button--primary.is-plain {
  border-color:var(--primary-btn-plain-border);
  background:var(--primary-btn-plain-bg);
  color:var(--primary-btn-plain)
}
.b-button--primary.is-plain:hover {
  border-color:var(--primary-btn-border-hover);
  background:var(--primary-btn-bg-hover);
  color:var(--primary-btn-hover)
}
.b-button--primary.is-plain:active {
  border-color:var(--primary-btn-border-active);
  background:var(--primary-btn-bg-active);
  color:var(--primary-btn-active)
}
.b-button--warning {
  border-color:var(--warning-btn-border);
  background:var(--warning-btn-bg);
  color:var(--warning-btn)
}
.b-button--warning:hover {
  border-color:var(--warning-btn-border-hover);
  background:var(--warning-btn-bg-hover);
  color:var(--warning-btn-hover)
}
.b-button--warning:active {
  border-color:var(--warning-btn-border-active);
  background:var(--warning-btn-bg-active);
  color:var(--warning-btn-active)
}
.b-button--warning.is-plain {
  border-color:var(--warning-btn-plain-border);
  background:var(--warning-btn-plain-bg);
  color:var(--warning-btn-plain)
}
.b-button--warning.is-plain:hover {
  border-color:var(--warning-btn-border-hover);
  background:var(--warning-btn-bg-hover);
  color:var(--warning-btn-hover)
}
.b-button--warning.is-plain:active {
  border-color:var(--warning-btn-border-active);
  background:var(--warning-btn-bg-active);
  color:var(--warning-btn-active)
}
.b-button--danger {
  border-color:var(--danger-btn-border);
  background:var(--danger-btn-bg);
  color:var(--danger-btn)
}
.b-button--danger:hover {
  border-color:var(--danger-btn-border-hover);
  background:var(--danger-btn-bg-hover);
  color:var(--danger-btn-hover)
}
.b-button--danger:active {
  border-color:var(--danger-btn-border-active);
  background:var(--danger-btn-bg-active);
  color:var(--danger-btn-active)
}
.b-button--danger.is-plain {
  border-color:var(--danger-btn-plain-border);
  background:var(--danger-btn-plain-bg);
  color:var(--danger-btn-plain)
}
.b-button--danger.is-plain:hover {
  border-color:var(--danger-btn-border-hover);
  background:var(--danger-btn-bg-hover);
  color:var(--danger-btn-hover)
}
.b-button--danger.is-plain:active {
  border-color:var(--danger-btn-border-active);
  background:var(--danger-btn-bg-active);
  color:var(--danger-btn-active)
}
.b-button--success {
  border-color:var(--success-btn-border);
  background:var(--success-btn-bg);
  color:var(--success-btn)
}
.b-button--success:hover {
  border-color:var(--success-btn-border-hover);
  background:var(--success-btn-bg-hover);
  color:var(--success-btn-hover)
}
.b-button--success:active {
  border-color:var(--success-btn-border-active);
  background:var(--success-btn-bg-active);
  color:var(--success-btn-active)
}
.b-button--success.is-plain {
  border-color:var(--success-btn-plain-border);
  background:var(--success-btn-plain-bg);
  color:var(--success-btn-plain)
}
.b-button--success.is-plain:hover {
  border-color:var(--success-btn-border-hover);
  background:var(--success-btn-bg-hover);
  color:var(--success-btn-hover)
}
.b-button--success.is-plain:active {
  border-color:var(--success-btn-border-active);
  background:var(--success-btn-bg-active);
  color:var(--success-btn-active)
}
.b-button--info {
  border-color:var(--info-btn-border);
  background:var(--info-btn-bg);
  color:var(--info-btn)
}
.b-button--info:hover {
  border-color:var(--info-btn-border-hover);
  background:var(--info-btn-bg-hover);
  color:var(--info-btn-hover)
}
.b-button--info:active {
  border-color:var(--info-btn-border-active);
  background:var(--info-btn-bg-active);
  color:var(--info-btn-active)
}
.b-button--info.is-plain {
  border-color:var(--info-btn-plain-border);
  background:var(--info-btn-plain-bg);
  color:var(--info-btn-plain)
}
.b-button--info.is-plain:hover {
  border-color:var(--info-btn-border-hover);
  background:var(--info-btn-bg-hover);
  color:var(--info-btn-hover)
}
.b-button--info.is-plain:active {
  border-color:var(--info-btn-border-active);
  background:var(--info-btn-bg-active);
  color:var(--info-btn-active)
}
</style>
<!-- @restored:style:END -->
