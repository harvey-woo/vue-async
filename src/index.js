function createWatchers(){
  return Object.keys(this.$options.asyncComputed).forEach(key => {
    this.$asyncWatchers = this.$asyncWatchers || [];
  if (!this.$asyncWatchers[key]) {
    this.$asyncWatchers[key] = this.$watch(() => this.$options.asyncComputed[key].call(this, this.$asyncOptions.context.call(this)), async (p) => {
      this[key] = undefined;
      this[key] = await p;
    }, {
      immediate: true
    });
  }
});
}

function destroyWatchers() {
  return Object.keys(this.$options.asyncComputed).forEach(key => {
      this.$asyncWatchers[key]();
})
}

export default {
  install(Vue, options) {
    Vue.prototype.$asyncOptions = options;
    Vue.config.optionMergeStrategies.asyncComputed = Vue.config.optionMergeStrategies.computed;
    Vue.mixin({
      activated() {
        if (this.$options.asyncComputed) {
          createWatchers.call(this);
        }
      },
      deactivated(){
        if (this.$options.asyncComputed) {
          destroyWatchers.call(this);
        }
      },
      created() {
        if (this.$options.asyncComputed) {
          createWatchers.call(this);
        }
      },
      data() {
        if (this.$options.asyncComputed) {
          return Object.keys(this.$options.asyncComputed).reduce((data, key) => {
              data[key] = undefined;
          return data;
        }, {});
        }
        return {};
      }
    });
  }
}
