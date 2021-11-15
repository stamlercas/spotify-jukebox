import Sync from './sync'
import Sketch from './sketch'

export default class Visualizer {
  constructor ({ currentlyPlaying, trackAnalysis, trackFeatures, volumeSmoothing = 100, hidpi = true }) {
    /** Initialize Sync class. */
    this.sync = new Sync({ currentlyPlaying, trackAnalysis, trackFeatures, volumeSmoothing })

    /** Initialize Sketch class. Assign `this.paint` as the main animation loop. */
    this.sketch = new Sketch({
      main: this.paint.bind(this),
      hidpi
    })

    this.watch()
    this.hooks()
  }

  /**
   * @method watch - Watch for changes in state.
   */
  watch () {
    this.sync.watch('active', val => {
      /** Start and stop sketch according to the `active` property on our Sync class. */
      if (val === true) {
        this.sketch.start()
      } else {
        this.sketch.stop()
      }
    })
  }

  stop() {
    this.sketch.stop();
    this.sketch.canvas.remove();
  }

  /**
   * @method hooks - Attach hooks to interval change events. 
   */
  hooks () {

  }

  /**
   * @method paint - Paint a single frame of the main animation loop.
   */
  paint () {

  }
}