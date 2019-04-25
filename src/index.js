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


function initAsyncItemsOptions() {
  if (this.$options.asyncComputed && !this.$asyncComputedItems) {
    if (this.$options.asyncOptions) {
      this.$asyncOptions = {
        ...this.$asyncOptions,
        ...this.$options.asyncOptions
      }
    }
    this.$asyncComputedItems = Object.keys(this.$options.asyncComputed).map((key) => {
      let item = this.$options.asyncComputed[key];
      if (typeof item !== 'object') {
        item = {
          get: item
        }
      }
      item = {
        key,
        ...(this.$isServer ? {} : {
          currentFnResult: undefined,
          watchOpts: {
            fn: () => { return item.currentFnResult = item.get.call(this) },
            callback: async (p) => {
              this[key] = typeof item.default === 'function' ? item.default.call(this, this[key]) : item.default;
              try {
                this[key] = await p;
              } catch(e) {
                item.error.call(this, e, 'asyncComputed');
              }
            }
          },
        }),
        ...this.$asyncOptions,
        ...item
      }
      return item
    });
  }
}

function activateWatcher(initData = {}) {
  if (this.$asyncComputedItems && !this.$isServer) {
    return this.$asyncComputedItems.forEach(item => {
      if (!item.watcher) {
        const hasInitData = item.key in initData
        item.watcher = this.$watch(item.watchOpts.fn, item.watchOpts.callback, {
          immediate: !hasInitData
        });
        if (hasInitData) {
          this[item.key] = initData[item.key]
        }
      }
    });
  }
}

function deactivateWatcher() {
  if (this.$asyncComputedItems) {
    this.$asyncComputedItems.forEach(item => {
      if (item.destoryWhenDeactivated) {
        item.watcher();
        item.watcher = null;
      }
    })
  }
}


function initAcyncData(vm, initData) {
  activateWatcher.call(vm, initData)
  if (vm.$children) {
    vm.$children.forEach((child, i) => {
      initAcyncData(child, initData.$children[i])
    })
  }
}

function fetchAsyncData() {
  return this.$options.asyncData.call(this).then((data) => {
    Object.keys(data).forEach(k => {
      this[k] = data[k]
    })
  }, (e) => {
    this.$asyncOptions.error.call(this, e, 'asyncData')
  })
}



export const mixin = {

  beforeCreate() {
    initAsyncItemsOptions.call(this)
    // if (this.$root === this && this.$isServer) {
    //   const oldRender = this.$options.render
    //   this.$options.render = (...args) => {
    //     const vdom = oldRender.call(this, ...args)
    //     this.$asyncOptions.context.asyncInitState = extractInitState(this)
    //     return vdom
    //   }
    // }
  },
  deactivated(){
    deactivateWatcher.call(this)
  },
  mounted() {
    if (this.$root === this && !this.$isServer) {
      initAcyncData(this, global.VUE_ASYNC_INIT_STATE)
    }
  },
  created() {

    // if (this.$root === this) {
    //   if (this.$isServer) {

    //   } else {
    //     initAcyncData(this, { a: 'b' })
    //   }
    // }

  },
  methods: {
    $asyncReady() {
      return Promise.all(this.$asyncComputedItems.map(item => item.currentFnResult));
    }
  },
  async serverPrefetch() {
    if (this.$asyncComputedItems) {
      await Promise.all(this.$asyncComputedItems.map(async item => {
        this[item.key] = await item.get()
      }))
    }
    if (this.$options.asyncData && this.$options.asyncDataServerPrefetch) {
      await fetchAsyncData.call(this)
    }
  },
  data() {
    let data = {}
    if (this.$asyncComputedItems) {
      data = this.$asyncComputedItems.reduce((data, item) => {
        data[item.key] = typeof item.default === 'function' ? item.default.call(this) : item.default;
        return data;
      }, {})
    }
    if (this.$options.asyncData && !this.$options.asyncDataServerPrefetch) {
      fetchAsyncData.call(this)
    }
    return data;
  }
};

export default {
  install(Vue, options) {
    options = options || {}
    if (options) {
      const DEFAULT_OPTIONS = {
        default: undefined,
        watcher: null,
        destoryWhenDeactivated: true,
        error(e, info) {
          handleError(Vue.config, e, this, info)
        }
      }
      Vue.prototype.$asyncOptions = {
        ...DEFAULT_OPTIONS,
        ...options
      };
    }
    Vue.config.optionMergeStrategies.asyncComputed = Vue.config.optionMergeStrategies.computed;
    Vue.mixin(mixin);
  }
}
