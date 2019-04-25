<template>
  <div>
    <h1>hello world</h1>
    <div>data is: {{a}} {{b}}</div>
    <inner-component></inner-component>
  </div>
</template>
<script>
  import delay from './delay'
  import InnerComponent from './components/inner-component.vue'
  export default {
    components: {
      InnerComponent
    },
    asyncComputed: {
      async a() {
        await delay(2000)
        return 'loaded'
      }
    },
    data() {
      return { b: undefined }
    },
    async asyncData() {
      await delay(3000)
      return {
        b: 'aaa'
      }
    }
  }
</script>