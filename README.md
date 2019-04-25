![logo](./logo.png)

# Vue Async
本插件意在无痛解决vue处理异步数据的一揽子问题。包括异步的computed以及异步data，以及提供其相关服务端的方案


# 支持

> 本resistry仍在开发阶段，并不可用，感谢客官们的关注

- [x] asyncComputed browser
- [x] asyncComputed server
- [ ] asyncData browser and server

# 安装


```
import Vue from 'vue';
import async from '@cat5th/vue-async/src/index'
Vue.mixin(async)
```

# 使用
```vue
<template>
  <div v-if="myData">{{myData}}</div>
</templat>
<script>
  import Request from '@lianj/dollar2/src/request'
  export default {
    asyncComputed: {
       myData() {
          return Request.send('http://myapi.com/path', this.params);
       }
    }
  }
</script>
```