let dpiVal = null

const getSysDPI = function () {
  const $el = document.getElementById('dpi')
  const val = $el.offsetHeight

  return val
}

const DPI = {
  get () {
    if (!dpiVal) {
      dpiVal = getSysDPI()
    }

    return dpiVal
  },

  set (v) {
    dpiVal = v
  }
}

export default DPI
