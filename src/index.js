function handleError(config, err, vm, info) {
  if (vm) {
    let cur = vm
    while ((cur = cur.$parent)) {
      const hooks = cur.$options.errorCaptured
      if (hooks) {
        for (let i = 0; i < hooks.length; i++) {
          try {
            const capture = hooks[i].call(cur, err, vm, info) === false
            if (capture) return
          } catch (e) {
            globalHandleError(config, e, cur, 'errorCaptured hook')
          }
        }
      }
    }
  }
  globalHandleError(config, err, vm, info)
}

function globalHandleError(config, err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      console.error(e)
    }
  }
  console.error(err)
}

// 上面两个函数来自于Vue

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
        if (item.destoryWhenDeactivated) {
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
                item.error.call(this, e, item.vueConfig);
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
  destoryWhenDeactivated: true,
  error(e, vueConfig) {
    handleError(vueConfig, e, this, 'asyncComputed')
  }
}

export default {
  install(Vue, options) {
    options = options || {}
    if (options) {
      Vue.prototype.$asyncOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        vueConfig: Vue.config
      };
    }
    Vue.config.optionMergeStrategies.asyncComputed = Vue.config.optionMergeStrategies.computed;
    Vue.mixin(mixin);
  }
}
