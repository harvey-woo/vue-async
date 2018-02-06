function createWatchers(){
  return this.$asyncWatcherItems.forEach(item => {
    const key = item.key
    if (!item.watcher) {
      item.watcher = this.$watch(() => item.get.call(this, this.$asyncOptions.context.call(this)), async (p) => {
        this[key] = typeof item.default === 'function' ? item.default.call(this, this[key]) : item.default;
        this[key] = await p;
      }, {
        immediate: true
      });
    }
  });
}

function destroyWatchers() {
  return this.$asyncWatcherItems.forEach(item => {
    item.watcher();
    item.watcher = null;
  })
}

export const mixin = {
  activated() {
    if (this.$asyncWatcherItems) {
      createWatchers.call(this);
    }
  },
  deactivated(){
    if (this.$asyncWatcherItems) {
      destroyWatchers.call(this);
    }
  },
  created() {
    if (this.$asyncWatcherItems) {
      createWatchers.call(this);
    }
  },
  data() {
    if (this.$options.asyncComputed) {
      const DEFAULT_ITEM = {
        default: undefined,
        watcher: null
      }
      this.$asyncWatcherItems = Object.keys(this.$options.asyncComputed).map((key) => {
        let item = this.$options.asyncComputed[key];
        if (typeof item !== 'object') {
          item = {
            get: item
          }
        }
        return {
          key,
          ...DEFAULT_ITEM,
          ...item
        }
      });
    }
    if (this.$asyncWatcherItems) {
      return this.$asyncWatcherItems.reduce((data, item) => {
        data[item.key] = typeof item.default === 'function' ? item.default.call(this) : item.default;
        return data;
      }, {})
    }
    return {};
  }
};

export default {
  install(Vue, options) {
    Vue.prototype.$asyncOptions = options;
    Vue.config.optionMergeStrategies.asyncComputed = Vue.config.optionMergeStrategies.computed;
    Vue.mixin(mixin);
  }
}
