const PX_PER_INCH = 96
const MM_PER_INCH = 25.4 // 25.4(mm) === 1(in)

const Unit = {
  mm: {
    toLogical (v) { // px2mm
      return v * MM_PER_INCH / PX_PER_INCH
    },

    toPhysical (v) { // mm2px
      return v * PX_PER_INCH / MM_PER_INCH
    }
  }
}

export default Unit
