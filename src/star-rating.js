import React from 'react'
import ReactDOM from 'react-dom'
import cx from 'classnames'

/**
 * @fileoverview react-star-rating
 * @author @cameronjroe
 * <StarRating
 *   name={string} - name for form input (required)
 *   caption={string} - caption for rating (optional)
 *   ratingAmount={number} - the rating amount (required, default: 5)
 *   rating={number} - a set rating between the rating amount (optional)
 *   disabled={boolean} - whether to disable the rating from being selected (optional)
 *   editing={boolean} - whether the rating is explicitly in editing mode (optional)
 *   size={string} - size of stars (optional)
 *   onRatingClick={function} - a handler function that gets called onClick of the rating (optional)
 *   />
 */

export default class StarRating extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      ratingCache: {
        pos: 0,
        rating: 0,
      },
      editing: props.editing || true,
      stars: 5,
      rating: 0,
      pos: 0,
      glyph: this.getStars(),
    }
  }

  /**
   * Gets the stars based on ratingAmount
   * @return {string} stars
   */
  getStars() {
    var stars = ''
    var numRating = this.props.ratingAmount
    for (var i = 0; i < numRating; i++) {
      stars += '\u2605'
    }
    return stars
  }

  componentWillMount() {
    this.min = 0
    this.max = this.props.ratingAmount || 5
    if (this.props.rating) {
      this.state.editing = this.props.editing || false
      var ratingVal = this.props.rating
      this.state.ratingCache.pos = this.getStarRatingPosition(ratingVal)
      this.state.ratingCache.rating = ratingVal

      this.setState({
        ratingCache: this.state.ratingCache,
        rating: ratingVal,
        pos: this.getStarRatingPosition(ratingVal),
      })
    }
  }

  componentDidMount() {
    this.root = ReactDOM.findDOMNode(this.refs.root)
    this.ratingContainer = ReactDOM.findDOMNode(this.refs.ratingContainer)
  }

  componentWillUnmount() {
    delete this.root
    delete this.ratingContainer
  }

  getPosition(e) {
    return e.pageX - this.root.getBoundingClientRect().left
  }

  applyPrecision(val, precision) {
    return parseFloat(val.toFixed(precision))
  }

  getDecimalPlaces(num) {
    var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)
    return !match
      ? 0
      : Math.max(
          0,
          (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)
        )
  }

  getWidthFromValue(val) {
    var min = this.min,
      max = this.max
    if (val <= min || min === max) {
      return 0
    }
    if (val >= max) {
      return 100
    }
    return (val / (max - min)) * 100
  }

  getValueFromPosition(pos) {
    var precision = this.getDecimalPlaces(this.props.step)
    var maxWidth = this.ratingContainer.offsetWidth
    var diff = this.max - this.min
    var factor = (diff * pos) / (maxWidth * this.props.step)
    factor = Math.ceil(factor)
    var val = this.applyPrecision(
      parseFloat(this.min + factor * this.props.step),
      precision
    )
    val = Math.max(Math.min(val, this.max), this.min)
    return val
  }

  calculate(pos) {
    var val = this.getValueFromPosition(pos),
      width = this.getWidthFromValue(val)

    width += '%'
    return { width, val }
  }

  getStarRatingPosition(val) {
    var width = this.getWidthFromValue(val) + '%'
    return width
  }

  getRatingEvent(e) {
    var pos = this.getPosition(e)
    return this.calculate(pos)
  }

  getSvg() {
    return (
      <svg
        className="react-star-rating__star"
        viewBox="0 0 286 272"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <polygon
            id="star-flat"
            points="143 225 54.8322122 271.352549 71.6707613 173.176275 0.341522556 103.647451 98.9161061 89.3237254 143 0 187.083894 89.3237254 285.658477 103.647451 214.329239 173.176275 231.167788 271.352549 "
          ></polygon>
        </g>
      </svg>
    )
  }

  handleMouseLeave() {
    this.setState({
      pos: this.state.ratingCache.pos,
      rating: this.state.ratingCache.rating,
    })
  }

  handleMouseMove(e) {
    // get hover position
    var ratingEvent = this.getRatingEvent(e)
    this.updateRating(ratingEvent.width, ratingEvent.val)
  }

  updateRating(width, val) {
    this.setState({
      pos: width,
      rating: val,
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps !== this.props) {
      this.updateRating(
        this.getStarRatingPosition(nextProps.rating),
        nextProps.rating
      )
      return true
    } else {
      return (
        nextState.ratingCache.rating !== this.state.ratingCache.rating ||
        nextState.rating !== this.state.rating
      )
    }
  }

  handleClick(e) {
    // is it disabled?
    if (this.props.disabled) {
      e.stopPropagation()
      e.preventDefault()
      return false
    }

    var ratingCache = {
      pos: this.state.pos,
      rating: this.state.rating,
      caption: this.props.caption,
      name: this.props.name,
    }

    this.setState({
      ratingCache: ratingCache,
    })

    this.props.onRatingClick(e, ratingCache)
  }

  treatName(title) {
    if (typeof title === 'string') {
      return title.toLowerCase().split(' ').join('_')
    }
  }

  render() {
    var caption = null
    var classes = cx({
      'react-star-rating__root': true,
      'rating-disabled': this.props.disabled,
      ['react-star-rating__size--' + this.props.size]: this.props.size,
      'rating-editing': this.state.editing,
    })

    // is there a caption?
    if (this.props.caption) {
      caption = (
        <span className="react-rating-caption">{this.props.caption}</span>
      )
    }

    // are we editing this rating?
    var starRating
    if (this.state.editing) {
      starRating = (
        <div
          ref="ratingContainer"
          className="rating-container rating-gly-star"
          data-content={this.state.glyph}
          onMouseMove={this.handleMouseMove.bind(this)}
          onMouseLeave={this.handleMouseLeave.bind(this)}
          onClick={this.handleClick.bind(this)}
        >
          <div
            className="rating-stars"
            data-content={this.state.glyph}
            style={{ width: this.state.pos }}
          ></div>
          <input
            type="number"
            name={this.props.name}
            value={this.state.ratingCache.rating}
            style={{ display: 'none !important' }}
            min={this.min}
            max={this.max}
            readOnly
          />
        </div>
      )
    } else {
      starRating = (
        <div
          ref="ratingContainer"
          className="rating-container rating-gly-star"
          data-content={this.state.glyph}
        >
          <div
            className="rating-stars"
            data-content={this.state.glyph}
            style={{ width: this.state.pos }}
          ></div>
          <input
            type="number"
            name={this.props.name}
            value={this.state.ratingCache.rating}
            style={{ display: 'none !important' }}
            min={this.min}
            max={this.max}
            readOnly
          />
        </div>
      )
    }

    return (
      <span className="react-star-rating">
        <span ref="root" style={{ cursor: 'pointer' }} className={classes}>
          {starRating}
        </span>
      </span>
    )
  }
}

StarRating.propTypes = {
  name: React.PropTypes.string.isRequired,
  caption: React.PropTypes.string,
  ratingAmount: React.PropTypes.number.isRequired,
  rating: React.PropTypes.number,
  onRatingClick: React.PropTypes.func,
  disabled: React.PropTypes.bool,
  editing: React.PropTypes.bool,
  size: React.PropTypes.string,
}

StarRating.defaultProps = {
  step: 0.5,
  ratingAmount: 5,
  onRatingClick() {},
  disabled: false,
}
