import Visualizer from './classes/visualizer'
import { interpolateRgb, interpolateBasis } from 'd3-interpolate'
import { getRandomElement } from './util/array'
import { sin, circle } from './util/canvas'

export default class Visualization extends Visualizer {
  constructor ({currentlyPlaying, trackAnalysis, trackFeatures, theme}) {
    super({ currentlyPlaying,  trackAnalysis, trackFeatures, 
        volumeSmoothing: 10 
    })
    this.theme = theme
  }

  hooks () {
    this.sync.on('bar', beat => {
      this.lastColor = this.nextColor || getRandomElement(this.theme)
      this.nextColor = getRandomElement(this.theme.filter(color => color !== this.nextColor))
      this.lastBackgroundColor = this.nextBackgroundColor || getRandomElement(this.theme.filter(color => color !== this.nextColor))
      this.nextBackgroundColor = getRandomElement(this.theme.filter(color => color !== this.nextColor))
    })
  }

  paint ({ ctx, height, width, now }) {
    const bar = interpolateBasis([0, this.sync.volume * 10, 0])(this.sync.bar.progress)
    const beat = interpolateBasis([0, this.sync.volume * 300, 0])(this.sync.beat.progress)

    const background = interpolateRgb(this.lastBackgroundColor, this.nextBackgroundColor)(this.sync.bar.progress)

    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)
    ctx.lineWidth = bar 
    ctx.strokeStyle = interpolateRgb(this.lastColor, this.nextColor)(this.sync.bar.progress)
    sin(ctx, now / 50, height / 2, this.sync.volume * 50, 100)
    ctx.stroke()
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.beginPath()
    ctx.lineWidth = beat
    circle(ctx, width / 2, height / 2, this.sync.volume * width / 5 + beat / 10)
    ctx.stroke()
    ctx.fill()
  }

  setTheme(theme) {
      this.theme = theme
  }
}