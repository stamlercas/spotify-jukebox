import Visualizer from './classes/visualizer'
import { interpolateRgb, interpolateBasis, interpolateRgbBasis } from 'd3-interpolate'
import { scaleLinear } from 'd3-scale'
import { getRandomElement } from './util/array'
import { sin, circle } from './util/canvas'

const TWO_PI = Math.PI * 2
const PI_OVER_180 = Math.PI / 180

export default class Visualization extends Visualizer {
  constructor ({currentlyPlaying, trackAnalysis, trackFeatures, theme}) {
    super({ currentlyPlaying,  trackAnalysis, trackFeatures, 
        volumeSmoothing: 75, 
        hidpi: false
    })
    this.setScales()
    this.theme = theme

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

  hooks () {
    this.sync.on('bar', bar => {
      this.lastColor = this.nextColor || getRandomElement(this.theme)
      this.nextColor = getRandomElement(this.theme.filter(color => color !== this.nextColor))
      this.lastBackgroundColor = this.nextBackgroundColor || getRandomElement(this.theme.filter(color => color !== this.nextColor))
      this.nextBackgroundColor = getRandomElement(this.theme.filter(color => color !== this.nextColor))
      this.lastComplimentColor = this.nextComplimentColor || getRandomElement(this.theme.filter(color => color !== this.nextColor || color !== this.nextBackgroundColor))
      this.nextComplimentColor = getRandomElement(this.theme.filter(color => color !== this.nextColor || color !== this.nextBackgroundColor))
    })

    this.sync.on('section', section => {
      console.log('new section')
      this.doPaintOverlay = Math.random() < 0.5 ? true : false;
      this.overlayColors = [getRandomElement(this.theme), getRandomElement(this.theme), getRandomElement(this.theme)]
    })
  }

  paint ({ ctx, height, width, now }) {
    const bar = interpolateBasis([0, this.sync.volume * 10, 0])(this.sync.bar.progress)
    const beat = interpolateBasis([0, this.sync.volume * 300, 0])(this.sync.beat.progress)

    // background
    ctx.fillStyle = interpolateRgb(this.lastBackgroundColor, this.nextBackgroundColor)(this.sync.bar.progress)
    ctx.fillRect(0, 0, width, height)
    // this.paintBackground({ctx, width, height, now})


    // sin wave in back
    ctx.lineWidth = bar 
    ctx.strokeStyle = interpolateRgb(this.lastComplimentColor, this.nextComplimentColor)(this.sync.bar.progress)
    sin(ctx, now / 50, height / 2, this.sync.volume * 50, 100)
    ctx.stroke()
    // ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    // ctx.beginPath()
    // ctx.lineWidth = beat
    // circle(ctx, width / 2, height / 2, this.sync.volume * width / 5 + beat / 10)
    // ctx.stroke()
    // ctx.fill()

    // sphere-ish shape
    this.paintCenter({ctx, width, height, now})

    // overlay
    this.paintOverlay({ctx, width, height, now})
  }

  setTheme(theme) {
      this.theme = theme
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

  paintBackground ({ ctx, width, height }) {
    this.sketch.ctx.fillStyle = this.gradient3
    ctx.fillRect(0, 0, width, height)
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
}