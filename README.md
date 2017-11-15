> **该模块以es7编写，请使用babel编译后使用**

# 支持
- [x] asyncComputed browser
- [ ] asyncComputed server
- [ ] asyncData browser and server

# 安装

```vue

<template>
  <div></div>
</template>
<script>
  import {mixin} from '@lianj/vue-async/src/index'
  export default {
    mixins: [mixin]
  }
</script>

```

或者全局安装
```
import Vue from 'vue';
import async from '@lianj/vue-async/src/index'
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