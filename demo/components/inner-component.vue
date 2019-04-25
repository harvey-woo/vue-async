<template>
  <div>hello {{c}} {{d}}</div>
</template>
<script>
  import delay from '../delay'
  const s = {a:11}
  export default {
    asyncComputed: {
      async c() {
        await delay(3000)
        return s
      },
      async d() {
        await delay(3000)
        return s
      }
    }
  }
</script>