import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Video from 'react-native-video';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    justifyContent: 'space-between',
    overflow: "hidden"
  },
  fullscreen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  video: {
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  top: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30 ,
    borderRadius: 8,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: '#444',
    zIndex: 1
  },
  buttonBase: {
    width: 45,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonBack: {
    borderRadius: 8,
    backgroundColor: '#444',
  },
  seekbar: {
    flex: 1,
    height: 30,
    flexDirection: 'row',
    alignItems: 'center'
  },
  baseTrack: {
    width: '100%',
    height: 6,
    borderRadius: 5,
    backgroundColor: '#666'
  },
  fillTrack: {
    position: 'absolute',
    backgroundColor: '#999',
  },
  seeker: {
    position: 'absolute',
    left: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff'
  },
  trackText: {
    color: '#EEEEEE',
    fontSize: 12,
    paddingLeft: 5,
    paddingRight: 5
  },
  icon: {
    width: 20,
    height: 20
  }
});

function timeFormat(time = 0) {
  const m = Math.round(time / 60).toFixed(0);

  let s = Math.round(time % 60).toFixed(0);
  s = s >= 10 ? s : `0${s}`;

  return `${m}:${s}`;
}

/**
 * A set of video player controls for the react-native-video component
 *
 * @export
 * @class Vplayer
 * @extends {Component}
 */
export default class Vplayer extends Component {
  static assets = {
    './assets/expand.png': require('./assets/expand.png'),
    './assets/pause.png': require('./assets/pause.png'),
    './assets/play.png': require('./assets/play.png'),
    './assets/spinner.png': require('./assets/spinner.png'),
    './assets/volume-off.png': require('./assets/volume-off.png'),
    './assets/volume-up.png': require('./assets/volume-up.png')
  }

  static defaultProps = {
    resizeMode: 'contain',
    paused: true,
    controlTimeoutDelay: 5000,
    repeat: false
  }

  static propTypes = {
    source: PropTypes.any,
    style: PropTypes.any,
    videoStyle: PropTypes.any,
    resizeMode: PropTypes.string,
    paused: PropTypes.bool
  }

  /**
   * Creates an instance of Vplayer.
   *
   * @param {*} props
   * @memberof Vplayer
   */
  constructor(props) {
    super(props);

    this.state = {
      paused: props.paused,

      mute: false,
      duration: 0,
      currentTime: 0,
      seeking: false,
      seekerOffset: 0,

      showControls: false,
      fullscreen: false
    };

    this.firstLoaded = false;
    this.seekerWidth = 0;
    this.seekerMoveStartOffset = 0;
    this.videoRef = null;
    this.loaded = false;
    this.loadedEvents = [];
    this.seekerPanResponder = this.getSeekerPanResponder();

    this.opacityAminated = new Animated.Value(0);
    this.controlTimeout = null;
  }

  componentWillUnmount() {
    this.clearControlTimeout();
  }

  resolveAsset(path) {
    const { resolver } = this.props;

    if (resolver) {
      return resolver(path, Vplayer.assets[path]);
    }

    return Vplayer.assets[path];
  }

  /**
   * Create seeker gesture responder
   *
   * @returns
   * @memberof Vplayer
   */
  getSeekerPanResponder() {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        this.seekerMoveStartOffset = this.state.seekerOffset;
        this.setState({ seeking: true });
      },

      onPanResponderMove: (e, gestureState) => {
        this.setSeekerOffset(this.seekerMoveStartOffset + gestureState.dx);
      },

      onPanResponderRelease: () => {
        const { currentTime } = this.state;
        this.setState({ seeking: false });
        this.videoRef.seek(Math.floor(Number(currentTime)));
      }
    })
  }

  /**
   *
   *
   * @param {*} callback
   * @returns
   * @memberof Vplayer
   */
  pushLoadedEvent(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    if (this.loaded) {
      callback();
    } else {
      this.loadedEvents.push(callback);
    }
  }

  /**
   *
   *
   * @param {number} [value=0]
   * @memberof Vplayer
   */
  setSeekerOffset(value = 0) {
    // constrain
    if (value <= 0) {
      value = 0;
    } else if (value >= this.seekerWidth) {
      value = this.seekerWidth;
    }

    const { duration } = this.state;
    const currentTime = value / this.seekerWidth * duration;

    this.setState({
      seekerOffset: value,
      currentTime,
    });
  }

  /**
   *
   *
   * @memberof Vplayer
   */
  onSeekbarLayout = (e) => {
    if (e.nativeEvent && e.nativeEvent.layout) {
      this.seekerWidth = e.nativeEvent.layout.width - 10; //
    }
    // error report
  }

  /**
   *
   *
   * @memberof Vplayer
   */
  onLoadStart = () => {
    this.loaded = false; // reset
  }

  /**
   *
   *
   * @memberof Vplayer
   */
  onLoad = (data) => {
    const { duration } = data;
    this.setState({ duration });

    if (!this.firstLoaded && this.videoRef) {
      this.videoRef.seek(0);
      this.firstLoaded = true; // For loading first time
    }

    // trigger loaded events
    this.loaded = true;
    const { loadedEvents } = this;
    while(loadedEvents.length) {
      const callback = loadedEvents.pop();
      callback();
    }
  }

  /**
   *
   *
   * @memberof Vplayer
   */
  onProgress = (e) => {
    const { seeking, duration } = this.state;
    const { currentTime } = e || { currentTime: 0 };

    if (!seeking) {
      const seekerOffset = (currentTime / duration) * this.seekerWidth;
      this.setState({
        currentTime,
        seekerOffset
      });
    }
  }

  onEnd = () => {
    const { repeat } = this.props;

    if (this.videoRef) {
      this.videoRef.seek(0);
      // tricky
      this.onProgress({ currentTime: 0 });
    }

    this.setState({ paused: !repeat });
  }

  /**
   *
   *
   * @memberof Vplayer
   */
  triggerPlay = () => {
    const { paused } = this.state;
    this.setState({ paused: !paused });
  }

  /**
   *
   *
   * @memberof Vplayer
   */
  triggerVolume = () => {
    const { mute } = this.state;
    this.setState({ mute: !mute });
  }

  /**
   *
   *
   * @memberof Vplayer
   */
  triggerExpand = () => {
    const { fullscreen } = this.state;
    this.setState({ fullscreen: !fullscreen }, () => {
      this.loaded = false; // reset
      this.seek(this.state.currentTime);
    });
  }

  /**
   *
   *
   * @param {*} time
   * @memberof Vplayer
   */
  seek(time) {
    // use `pushLoadedEvent` to make sure calling `seek` after `video.load`
    // see: https://github.com/react-native-community/react-native-video#seek
    this.pushLoadedEvent(() => {
      if (this.videoRef) {
        this.videoRef.seek(time);
      }
    });
  }

  setControlTimeout() {
    const { controlTimeoutDelay } = this.props;
    this.controlTimeout = setTimeout(() => {
      this.hideControls();
    }, controlTimeoutDelay)
  }

  clearControlTimeout() {
    clearTimeout(this.controlTimeout);
  }

  toggleControls = () => {
    const { showControls } = this.state;

    if (showControls) {
      this.hideControls();
    } else {
      this.showControls();
    }
  }

  showControls() {
    Animated.timing(
      this.opacityAminated,
      { toValue: 1 }
    ).start();
    this.setState({ showControls: true });
    this.setControlTimeout();
  }

  hideControls() {
    Animated.timing(
      this.opacityAminated,
      { toValue: 0 }
    ).start();
    this.setState({ showControls: false });
    this.clearControlTimeout();
  }

  /**
   *
   *
   * @returns
   * @memberof Vplayer
   */
  renderSeekbar() {
    const { seekerOffset } = this.state;

    return (
      <View style={styles.seekbar} onLayout={this.onSeekbarLayout}>
        <View style={styles.baseTrack} />
        <View style={[styles.baseTrack, styles.fillTrack, { width: seekerOffset }]} />
        <View
          style={[styles.seeker, { left: seekerOffset }]}
          {...this.seekerPanResponder.panHandlers }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        />
      </View>
    );
  }

  /**
   *
   *
   * @returns
   * @memberof Vplayer
   */
  renderBottomControls() {
    const {
      paused,
      duration,
      currentTime,
      showControls,
    } = this.state;

    return (
      <Animated.View
        style={[styles.bottom, { opacity: this.opacityAminated }, { display: showControls ? 'flex' : 'none' }]}
      >
        <TouchableOpacity style={styles.buttonBase} onPress={this.triggerPlay}>
          {paused ? (
            <Image style={styles.icon} source={this.resolveAsset('./assets/play.png')}/>
          ) : (
            <Image style={styles.icon} source={this.resolveAsset('./assets/pause.png')}/>
          )}
        </TouchableOpacity>
        <Text style={styles.trackText}>{timeFormat(currentTime)}</Text>
        {this.renderSeekbar()}
        <Text style={styles.trackText}>-{timeFormat(duration - currentTime)}</Text>
      </Animated.View>
    );
  }

  /**
   *
   *
   * @returns
   * @memberof Vplayer
   */
  renderTopControls() {
    const {
      mute,
      showControls
    } = this.state;

    return (
      <Animated.View
        style={[styles.top, { opacity: this.opacityAminated }, { display: showControls ? 'flex' : 'none' }]}
      >
        <TouchableOpacity
          style={[styles.buttonBase, styles.buttonBack]}
          onPress={this.triggerExpand}
        >
          <Image style={styles.icon} source={this.resolveAsset('./assets/expand.png')}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonBase, styles.buttonBack]}
          onPress={this.triggerVolume}
        >
          {mute ? (
            <Image style={styles.icon} source={this.resolveAsset('./assets/volume-off.png')}/>
          ) : (
            <Image style={styles.icon} source={this.resolveAsset('./assets/volume-up.png')}/>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  /**
   *
   *
   * @returns
   * @memberof Vplayer
   */
  renderVideo() {
    const {
      source,
      style,
      videoStyle,
      resizeMode
    } = this.props;
    const {
      paused,
      seeking,
      mute,
      fullscreen
    } = this.state;

    const viewStyle = fullscreen ? styles.fullscreen : style;

    return (
      <TouchableWithoutFeedback onPress={this.toggleControls}>
        <View style={[styles.container, viewStyle]}>
          <Video
            key={fullscreen ? 1 : 0}
            style={[styles.video, videoStyle]}
            source={source}
            paused={seeking || paused}
            volume={mute ? 0.0 : 1.0}
            controls={false}
            onLoadStart={this.onLoadStart}
            onLoad={this.onLoad}
            onProgress={this.onProgress}
            onEnd={this.onEnd}
            ref={(ins) => this.videoRef = ins}
            resizeMode={resizeMode}
          />
          {this.renderTopControls()}
          {this.renderBottomControls()}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  /**
   *
   *
   * @returns
   * @memberof Vplayer
   */
  render() {
    const {
      fullscreen
    } = this.state;

    if (fullscreen) {
      return (
        <Modal visible hardwareAccelerated onRequestClose={() => {}}>
          {this.renderVideo()}
        </Modal>
      );
    }

    return this.renderVideo();
  }
}
