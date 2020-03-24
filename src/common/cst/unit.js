import DPI from './dpi'
const MM_PER_INCH = 25.4 // 25.4(mm) === 1(in)

const Unit = {
  mm: {
    toLogical (v) { // px2mm
      return v * MM_PER_INCH / DPI.get()
    },

    toPhysical (v) { // mm2px
      return v * DPI.get() / MM_PER_INCH
    }
  }
}

export default Unit
