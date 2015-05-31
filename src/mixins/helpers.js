'use strict';

import React from 'react';
import ReactTransitionEvents from 'react/lib/ReactTransitionEvents';
import {getTrackCSS, getTrackLeft, getTrackAnimateCSS} from './helpers2';

var helpers = {
  initialize: function (props) {
    var slideCount = React.Children.count(props.children);
    var listWidth = this.refs.list.getDOMNode().getBoundingClientRect().width;
    var trackWidth = this.refs.track.getDOMNode().getBoundingClientRect().width;
    var slideWidth = this.getDOMNode().getBoundingClientRect().width/props.slidesToShow;

    this.setState({
      slideCount: slideCount,
      slideWidth: slideWidth,
      listWidth: listWidth,
      trackWidth: trackWidth,
      currentSlide: props.initialSlide

    }, function () {

      var targetLeft = getTrackLeft({
       slideIndex: this.state.currentSlide,
       infinite: props.infinite,
       centerMode: props.centerMode,
       slideCount: this.state.slideCount,
       slidesToShow: props.slidesToShow,
       slidesToScroll: this.props.slidesToScroll,
       slideWidth: this.state.slideWidth,
       trackRef: this.refs.track,
       listWidth: this.state.listWidth
      });
      // getCSS function needs previously set state
      var trackStyle = getTrackCSS({
        variableWidth: props.variableWidth,
        slideCount: this.state.slideCount,
        slidesToShow: props.slidesToShow,
        slideWidth: this.state.slideWidth,
        left: targetLeft
      });

      this.setState({trackStyle: trackStyle});

      this.autoPlay(); // once we're set up, trigger the initial autoplay.
    });
  },
  getLeft: function (slideIndex) {
    var slideOffset = 0;
    var targetLeft;
    var targetSlide;
    if (this.props.infinite === true) {
      if (this.state.slideCount > this.props.slidesToShow) {
       slideOffset = (this.state.slideWidth * this.props.slidesToShow) * -1;
      }
      if (this.state.slideCount % this.props.slidesToScroll !== 0) {
        if (slideIndex + this.props.slidesToScroll > this.state.slideCount && this.state.slideCount > this.props.slidesToShow) {
            if(slideIndex > this.state.slideCount) {
              slideOffset = ((this.props.slidesToShow - (slideIndex - this.state.slideCount)) * this.state.slideWidth) * -1;
            } else {
              slideOffset = ((this.state.slideCount % this.props.slidesToScroll) * this.state.slideWidth) * -1;
            }
        }
      }
    }

    if (this.props.centerMode === true && this.props.infinite === true) {
        slideOffset += this.state.slideWidth * Math.floor(this.props.slidesToShow / 2) - this.state.slideWidth;
    } else if (this.props.centerMode === true) {
        slideOffset = this.state.slideWidth * Math.floor(this.props.slidesToShow / 2);
    }

    targetLeft = ((slideIndex * this.state.slideWidth) * -1) + slideOffset;

    if (this.props.variableWidth === true) {
        var targetSlideIndex;
        if(this.state.slideCount <= this.props.slidesToShow || this.props.infinite === false) {
            targetSlide = this.refs.track.getDOMNode().childNodes[slideIndex];
        } else {
            targetSlideIndex = (slideIndex + this.props.slidesToShow);
            targetSlide = this.refs.track.getDOMNode().childNodes[targetSlideIndex];
        }
        targetLeft = targetSlide ? targetSlide.offsetLeft * -1 : 0;
        if (this.props.centerMode === true) {
            if(this.props.infinite === false) {
                targetSlide = this.refs.track.getDOMNode().childNodes[slideIndex];
            } else {
                targetSlide = this.refs.track.getDOMNode().childNodes[(slideIndex + this.props.slidesToShow + 1)];
            }

            targetLeft = targetSlide ? targetSlide.offsetLeft * -1 : 0;
            targetLeft += (this.state.listWidth - targetSlide.offsetWidth) / 2;
        }
    }

    return targetLeft;

  },
  getAnimateCSS: function (targetLeft) {
    var style = this.getCSS(targetLeft);
    style.WebkitTransition = '-webkit-transform ' + this.props.speed + 'ms ' + this.props.cssEase;
    style.transition = 'transform ' + this.props.speed + 'ms ' + this.props.cssEase;
    return style;
  },
  getCSS: function (targetLeft) {
    // implemented this instead of setCSS
    var trackWidth;
    if (this.props.variableWidth) {
      trackWidth = (this.state.slideCount + 2*this.props.slidesToShow)*this.state.slideWidth;
    } else if (this.props.centerMode) {
      trackWidth = (this.state.slideCount + 2*(this.props.slidesToShow + 1)) *this.state.slideWidth;
    } else {
      trackWidth = (this.state.slideCount + 2*this.props.slidesToShow )*this.state.slideWidth;
    }
    var style = {
      opacity: 1,
      width: trackWidth,
      WebkitTransform: 'translate3d(' + targetLeft + 'px, 0px, 0px)',
      transform: 'translate3d(' + targetLeft + 'px, 0px, 0px)',
      transition: '',
      WebkitTransition: ''
    };

    return style;
  },
  adaptHeight: function () {
    var selector = '[data-index="' + this.state.currentSlide +'"]';
    if (this.refs.list) {
      var slickList = this.refs.list.getDOMNode();
      slickList.style.height = slickList.querySelector(selector).offsetHeight + 'px';
    }
  },
  slideHandler: function (index, sync, dontAnimate) {
    // Functionality of animateSlide and postSlide is merged into this function
    // console.log('slideHandler', index);
    var targetSlide, currentSlide;
    var targetLeft, currentLeft;

    if (this.state.animating === true) {
      return;
    }

    // To prevent the slider from sticking in animating state, If we click on already active dot
    if (this.props.fade === true && this.state.currentSlide === index) {
      return;
    }
    if (this.state.slideCount <= this.props.slidesToShow) {
      return;
    }

    targetSlide = index;
    if (targetSlide < 0) {
      if (this.state.slideCount % this.props.slidesToScroll !== 0) {
        currentSlide = this.state.slideCount - (this.state.slideCount % this.props.slidesToScroll);
      } else {
        currentSlide = this.state.slideCount + targetSlide;
      }
    } else if (targetSlide >= this.state.slideCount) {
      if (this.state.slideCount % this.props.slidesToScroll !== 0) {
        currentSlide = 0;
      } else {
        currentSlide = targetSlide - this.state.slideCount;
      }
    } else {
      currentSlide = targetSlide;
    }

    targetLeft = getTrackLeft({
     slideIndex: targetSlide,
     infinite: this.props.infinite,
     centerMode: this.props.centerMode,
     slideCount: this.state.slideCount,
     slidesToShow: this.props.slidesToShow,
     slidesToScroll: this.props.slidesToScroll,
     slideWidth: this.state.slideWidth,
     trackRef: this.refs.track,
     listWidth: this.state.listWidth
    });

    currentLeft = getTrackLeft({
     slideIndex: currentSlide,
     infinite: this.props.infinite,
     centerMode: this.props.centerMode,
     slideCount: this.state.slideCount,
     slidesToShow: this.props.slidesToShow,
     slidesToScroll: this.props.slidesToScroll,
     slideWidth: this.state.slideWidth,
     trackRef: this.refs.track,
     listWidth: this.state.listWidth
    });

    if (this.props.infinite === false) {
      targetLeft = currentLeft;
    }

    if (this.props.beforeChange) {
      this.props.beforeChange(currentSlide);
    }

    var nextStateChanges = {
      animating: false,
      trackStyle: getTrackCSS({
        variableWidth: this.props.variableWidth,
        slideCount: this.state.slideCount,
        slidesToShow: this.props.slidesToShow,
        slideWidth: this.state.slideWidth,
        left: currentLeft
      }),
      swipeLeft: null
    };

    var callback = () => {
      this.setState(nextStateChanges);
      if (this.props.afterChange) {
        this.props.afterChange(currentSlide);
      }
      ReactTransitionEvents.removeEndEventListener(this.refs.track.getDOMNode(), callback);
    };

    this.setState({
      animating: true,
      currentSlide: currentSlide,
      currentLeft: currentLeft,
      trackStyle: getTrackAnimateCSS({
        variableWidth: this.props.variableWidth,
        slideCount: this.state.slideCount,
        slidesToShow: this.props.slidesToShow,
        slideWidth: this.state.slideWidth,
        left: targetLeft,
        speed: this.props.speed,
        cssEase: this.props.cssEase
      })
    }, function () {
      ReactTransitionEvents.addEndEventListener(this.refs.track.getDOMNode(), callback);
    });

    this.autoPlay();
  },
  swipeDirection: function (touchObject) {
    var xDist, yDist, r, swipeAngle;

    xDist = touchObject.startX - touchObject.curX;
    yDist = touchObject.startY - touchObject.curY;
    r = Math.atan2(yDist, xDist);

    swipeAngle = Math.round(r * 180 / Math.PI);
    if (swipeAngle < 0) {
        swipeAngle = 360 - Math.abs(swipeAngle);
    }
    if ((swipeAngle <= 45) && (swipeAngle >= 0) || (swipeAngle <= 360) && (swipeAngle >= 315)) {
        return (this.props.rtl === false ? 'left' : 'right');
    }
    if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
        return (this.props.rtl === false ? 'right' : 'left');
    }

    return 'vertical';
  },
  autoPlay: function () {
    var play = () => {
      if (this.state.mounted) {
        this.slideHandler(this.state.currentSlide + this.props.slidesToScroll);
      }
    };
    if (this.props.autoplay) {
      window.clearTimeout(this.state.autoPlayTimer);
      this.setState({
        autoPlayTimer: window.setTimeout(play, this.props.autoplaySpeed)
      });
    }
  }
};

module.exports = helpers;
