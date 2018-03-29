export const mixin = {
  activated() {
    if (this.$asyncWatcherItems) {
      return this.$asyncWatcherItems.forEach(item => {
        if (!item.watcher) {
          item.watcher = this.$watch(item.watchOpts.fn, item.watchOpts.callback, {
            immediate: true
          });
        }
      });
    }
  },
  deactivated(){
    if (this.$asyncWatcherItems) {
      this.$asyncWatcherItems.forEach(item => {
        if (item.destroyWhenDeactivated) {
          item.watcher();
          item.watcher = null;
        }
      })
    }
  },
  created() {
    if (this.$asyncWatcherItems) {
      return this.$asyncWatcherItems.forEach(item => {
        if (!item.watcher) {
          item.watcher = this.$watch(item.watchOpts.fn, item.watchOpts.callback, {
            immediate: true
          });
        }
      });
    }
  },
  methods: {
    $asyncReady() {
      return Promise.all(this.$asyncWatcherItems.map(item => item.currentFnResult));
    }
  },
  data() {
    if (this.$options.asyncComputed) {
      if (this.$options.asyncOptions) {
        this.$asyncOptions = {
          ...this.$asyncOptions,
          ...this.$options.asyncOptions
        }
      }
      this.$asyncWatcherItems = Object.keys(this.$options.asyncComputed).map((key) => {
        let item = this.$options.asyncComputed[key];
        if (typeof item !== 'object') {
          item = {
            get: item
          }
        }
        item = {
          key,
          currentFnResult: undefined,
          watchOpts: {
            fn: () => { return item.currentFnResult = item.get.call(this, item.context.call(this)) },
            callback: async (p) => {
              this[key] = typeof item.default === 'function' ? item.default.call(this, this[key]) : item.default;
              try {
                this[key] = await p;
              } catch(e) {
                if (item.error) {
                  item.error.call(this, e);
                } else {
                  throw e;
                }
              }
            }
          },
          ...this.$asyncOptions,
          ...item
        }
        return item
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

const DEFAULT_OPTIONS = {
  default: undefined,
  watcher: null,
  destroyWhenDeactivated: true
}

export default {
  install(Vue, options) {
    options = options || {}
    if (options) {
      Vue.prototype.$asyncOptions = {
        ...DEFAULT_OPTIONS,
        ...options
      };
    }
    Vue.config.optionMergeStrategies.asyncComputed = Vue.config.optionMergeStrategies.computed;
    Vue.mixin(mixin);
  }
}
