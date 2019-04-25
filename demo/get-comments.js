export default function getComments(test, one, context) {
  context = context || document.getElementsByTagName("html")[0];
  const result = [];
  function recurse(elem) {
    if (elem.nodeType === Node.COMMENT_NODE) {
      if (typeof test === 'function' && test(elem) || new RegExp(test).test(elem.textContent)) {
        result.push(elem);
      }
    }
    if (elem.childNodes && elem.childNodes.length) {
      for (let i = 0; i < elem.childNodes.length; i++) {
        recurse(elem.childNodes[i]);
        if (one && result.length) break;
      }
    }
  }
  recurse(context);
  return one ? result[0] : result
}