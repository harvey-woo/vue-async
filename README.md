> **该模块以es7编写，请使用babel编译后使用**


# 如何使用

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
