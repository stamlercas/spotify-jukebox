import Visualizer from './classes/visualizer'
import { interpolateRgb, interpolateBasis, interpolateRgbBasis } from 'd3-interpolate'
import { scaleLinear } from 'd3-scale'
import { getRandomElement } from './util/array'
import { sin, circle } from './util/canvas'

const TWO_PI = Math.PI * 2
const PI_OVER_180 = Math.PI / 180

export default class Visualization extends Visualizer {
  constructor ({currentlyPlaying, trackAnalysis, trackFeatures, palette = {}}) {
    super({ currentlyPlaying,  trackAnalysis, trackFeatures, 
        volumeSmoothing: 75, 
        hidpi: false
    })
    this.palette = palette

    this.setScales()

    this.sync.watch('trackFeatures', () => {
      this.sync.state.volumeSmoothing = this.smoothingScale(this.sync.state.trackFeatures.energy)
    })
  }

  setScales() {
    this.rotationScale = scaleLinear()
      .domain([0, 1])
      .range([3000, 800])

    this.radiusScale = scaleLinear()
      .domain([0, .3, .6, 1])
      .range([.5, 1, 1.1, 1.2])

    this.smoothingScale = scaleLinear()
    .domain([0, 1])
    .range([100, 30])
  }

  createGradient(color1, color2) {
    const gradientRadius = (this.sketch.height > this.sketch.width)
      ? this.sketch.height / 2
      : this.sketch.width / 2

    const center = {
      x: this.sketch.width / 2,
      y: this.sketch.height / 2
    }

    let backgroundGradient = this.sketch.ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, gradientRadius)
    backgroundGradient.addColorStop(0, color1)
    backgroundGradient.addColorStop(1, color2)
    return backgroundGradient;
  }

  hooks () {
    this.sync.on('bar', bar => {
      let theme = this.getPaletteHexColors();
    })

    this.sync.on('section', section => {
      let theme = this.getPaletteHexColors();

      this.lastColor = this.nextColor || getRandomElement(theme)
      this.nextColor = getRandomElement(theme.filter(color => color !== this.nextColor))

      this.doPaintOverlay = Math.random() < 0.5 ? true : false;
      let startOverlayColor = getRandomElement(theme)
      this.overlayColors = [startOverlayColor, getRandomElement(theme), getRandomElement(theme), startOverlayColor]

      this.setBackgroundColors()

      this.lastComplimentColor = this.nextComplimentColor || getRandomElement(theme.filter(color => color !== this.nextColor || color !== this.currentBackgroundColor))
      this.nextComplimentColor = getRandomElement(theme.filter(color => color !== this.nextColor || color !== this.currentBackgroundColor))
    })
  }

  setBackgroundColors() {
    let theme = this.getPaletteHexColors();
    this.lastBackgroundColor = this.currentBackgroundColor || getRandomElement(theme.filter(color => color !== this.nextColor))
    this.currentBackgroundColor = this.nextBackgroundColor || getRandomElement(theme.filter(color => color !== this.nextColor))
    this.nextBackgroundColor = getRandomElement(theme.filter(color => color !== this.nextColor || color !== this.currentBackgroundColor))
  }

  paint ({ ctx, height, width, now }) {
    const beat = interpolateBasis([0, this.sync.volume * 300, 0])(this.sync.beat.progress)

    this.paintBackground({ctx, width, height})

    this.paintOuterLines({ctx, width, height, now})
    this.paintInnerLines({ctx, width, height, now})

    // sin wave in back
    // this.paintSin({ctx, width, height, now})

    // // sphere-ish shape
    // this.paintCenter({ctx, width, height, now})

    // overlay
    // this.paintOverlay({ctx, width, height, now})
  }

  setPalette(palette) {
    this.palette = palette
    // this.setBackgroundColors()
  }

  getPaletteHexColors() {
      return this.palette ? [this.palette.Vibrant, this.palette.LightMuted, this.palette.DarkMuted, this.palette.LightVibrant, this.palette.Muted].map(swatch => swatch.getHex()) : [];
  }

  createPath (ctx, { x, y }, iterations = 3) {
    ctx.beginPath()
    for (var i = 0; i < iterations * TWO_PI; i += PI_OVER_180) {
      const _x = x(i)
      const _y = y(i)
      if (i === 0) {
        ctx.moveTo(_x, _y)
      } else {
        ctx.lineTo(_x, _y)
      }
    }
  }

  paintBackground ({ ctx, width, height }) {
    // interpolate() will return an array of interpolations depending on the objects that are passed in. Use this to create background gradient of the 2 returned interpolations
    let color1 = interpolateRgb(this.currentBackgroundColor, this.nextBackgroundColor)(this.sync.section.progress)
    let color2 = interpolateRgb(this.lastBackgroundColor, this.currentBackgroundColor)(this.sync.section.progress)
    this.sketch.ctx.fillStyle = this.createGradient(color1, color2);  // fill in background gradient
    ctx.fillRect(0, 0, width, height)
  }

  paintSin({ctx, width, height, now}) {
    const bar = interpolateBasis([0, this.sync.volume * 10, 0])(this.sync.bar.progress)
    ctx.lineWidth = bar
    ctx.strokeStyle = interpolateRgb(this.lastComplimentColor, this.nextComplimentColor)(this.sync.bar.progress)
    sin(ctx, now / 50, height / 2, this.sync.volume * 50, 100)
    ctx.stroke()
  }

  paintCenter ({ ctx, width, height, now }) {
    const { progress } = this.sync.getInterval('beat')
    const base = (width > height) ? width / 10 : height / 10
    const iAmp = interpolateBasis([this.sync.volume * -base, this.sync.volume * base, this.sync.volume * -base]) 
    const amp = iAmp(progress) * this.radiusScale(this.sync.state.trackFeatures.energy) 
    const radius = (width > height) ? this.sync.volume * height / 3 : this.sync.volume * width / 3
    const x = ANGLE => (radius + amp*.5 * Math.sin(7 * (ANGLE + now/this.rotationScale(this.sync.state.trackFeatures.energy)*4))) * Math.cos(ANGLE) + width/2
    const y = ANGLE => (radius + amp*.5 * Math.sin(7 * (ANGLE + now/this.rotationScale(this.sync.state.trackFeatures.energy)))) * Math.sin(ANGLE) + height/2
    const iLineWidth = interpolateBasis([this.sync.volume * (width > height ? width : height) / 50, this.sync.volume , this.sync.volume  * (width > height ? width : height) / 50])

    this.createPath(ctx, { x, y })

    ctx.lineWidth = iLineWidth(progress)
    ctx.strokeStyle = interpolateRgb(this.lastColor, this.nextColor)(this.sync.bar.progress)
    ctx.stroke()
  }

  paintOverlay ({ ctx, width, height, now }) {
    if (this.doPaintOverlay) {
      if (!this.backgroundTick) {
        this.backgroundTick = now
      }

      const backgroundProgress = Math.min((now - this.backgroundTick) / 10000, 1)
      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      ctx.fillStyle = interpolateRgbBasis(this.overlayColors)(backgroundProgress)
      ctx.fillRect(0, 0, width, height)
      ctx.restore()

      if (backgroundProgress === 1) {
        this.backgroundTick = now
      }
    }
  }

  paintInnerLines ({ ctx, width, height, now }) {
    const { progress } = this.sync.getInterval('bar')
    const amp = interpolateBasis([this.sync.volume * (height / 5), this.sync.volume * (height / 5)])(progress)
    const radius = (width > height) ? this.sync.volume * height / 3 : this.sync.volume * width / 3
    const x = ANGLE => (radius + amp * Math.sin(2.019 * (ANGLE + now/this.rotationScale(this.sync.state.trackFeatures.energy) * 8))) * Math.cos(ANGLE) + width/2
    const y = ANGLE => (radius + amp * Math.sin(2.019 * (ANGLE + now/this.rotationScale(this.sync.state.trackFeatures.energy) * 4))) * Math.sin(ANGLE) + height/2

    this.createPath(ctx, { x, y }, 15)

    ctx.lineWidth = Math.min(this.sync.volume, 1)
    ctx.strokeStyle = interpolateRgb(this.lastComplimentColor, this.nextComplimentColor)(this.sync.section.progress)
    ctx.stroke()
  }

  paintOuterLines ({ ctx, width, height, now }) {
    const { progress } = this.sync.getInterval('beat')
    const base = (width > height) ? width / 10 : height / 10
    const iAmp = interpolateBasis([this.sync.volume * -base, this.sync.volume * base, this.sync.volume * -base]) 
    const amp = iAmp(progress) * this.radiusScale(this.sync.state.trackFeatures.energy) / 4
    const radius = (width > height) ? this.sync.volume * height / 3 : this.sync.volume * width / 3
    const x = ANGLE => (radius + amp * Math.sin(7 * (ANGLE + now/this.rotationScale(this.sync.state.trackFeatures.energy)))) * Math.tan(ANGLE) + width/2
    const y = ANGLE => (radius + amp * Math.sin(7 * (ANGLE + now/this.rotationScale(this.sync.state.trackFeatures.energy)/2))) * Math.cos(ANGLE) + height/2

    this.createPath(ctx, { x, y })
    
    ctx.lineWidth = (this.sync.volume * 5)
    ctx.strokeStyle = interpolateRgb(this.lastColor, this.nextColor)(this.sync.section.progress)
    ctx.stroke()
    ctx.fillRect(0, (height/2) - (this.sync.volume * 20), width, this.sync.volume * 40)
  }
}