<!--
  BProgress — reconstructed from app.asar (Bilidown v1.2.7)
  <template> was decompiled from the compiled render function;
  <script> is the original component options object (identifiers restored).
-->
<template>
<div class="b-progress-bar">
  <span class="b-progress-fill" :style="[{
  'background-color': color
}]" ref="fill" />
</div>
</template>

<script>
export default {
  install(Vue) {
    Vue.component(this.name, this);
  },
  name: "BProgress",
  props: {
    color: {
      type: String,
      default: "rgba(51, 160, 111, .55)"
    },
    value: {
      type: [String, Number],
      default: 0
    }
  },
  mounted() {
    setTimeout(() => this.render());
  },
  watch: {
    value() {
      this.render();
    }
  },
  methods: {
    render() {
      if (this.$refs.fill) {
        this.$refs.fill.style.width = this.value + "%";
      }
    }
  }
};
</script>


<!-- @restored:style:START -->
<style scoped>
.b-progress-bar {
  width:450px;
  background-color:var(--progress-bar-bg);
  height:9.5px;
  border-radius:980px;
  overflow:hidden;
  position:relative
}
.b-progress-bar .b-progress-fill {
  display:block;
  height:100%;
  max-width:100%;
  width:0;
  transition:width .05s ease-in-out
}
.b-progress-bar .b-progress-fill:after {
  content:"";
  display:block;
  width:100%;
  height:100%;
  left:0;
  top:0;
  background-image:linear-gradient(-45deg,hsla(0,0%,100%,.2) 25%,transparent 0,transparent 50%,hsla(0,0%,100%,.2) 0,hsla(0,0%,100%,.2) 75%,transparent 0,transparent);
  background-size:40px 40px;
  animation:loading-line-b6c0c38a 2.5s linear infinite
}
</style>
<!-- @restored:style:END -->
