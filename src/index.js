import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
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

// 全屏播放
// 音量控制
// 进度控制
// 播放暂停控制
export default class Vplayer extends Component {
  static defaultProps = {
    resizeMode: 'contain',
    paused: true
  }

  static propTypes = {
    source: PropTypes.any,
    style: PropTypes.any,
    videoStyle: PropTypes.any,
    resizeMode: PropTypes.string,
    paused: PropTypes.bool
  }

  constructor(props) {
    super(props);

    this.state = {
      paused: props.paused,

      mute: false,
      duration: 0,
      currentTime: 0,
      seeking: false,
      seekerOffset: 0,

      fullscreen: false
    };

    this.shouldReseek = false;
    this.seekerWidth = 0;
    this.seekerMoveStartOffset = 0;
    this.videoRef = null;
    this.loaded = false;
    this.loadedEvents = [];
    this.seekerPanResponder = this.getSeekerPanResponder();
  }

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
        this.videoRef.seek(currentTime);
      }
    })
  }

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

  onSeekbarLayout = (e) => {
    if (e.nativeEvent && e.nativeEvent.layout) {
      this.seekerWidth = e.nativeEvent.layout.width - 10; //
    }
    // error report
  }

  onLoadStart = () => {
    this.loaded = false; // reset
  }

  onLoad = (data) => {
    const { duration } = data;
    this.setState({ duration });

    // trigger loaded events
    this.loaded = true;
    const { loadedEvents } = this;
    while(loadedEvents.length) {
      const callback = loadedEvents.pop();
      callback();
    }
  }

  onProgress = (e) => {
    const { seeking, duration } = this.state;

    if (!seeking) {
      const { currentTime } = e || { currentTime: 0 };
      const seekerOffset = (currentTime / duration) * this.seekerWidth;
      this.setState({
        currentTime,
        seekerOffset
      });
    }
  }

  triggerPlay = () => {
    const { paused } = this.state;
    this.setState({ paused: !paused });
  }

  triggerVolume = () => {
    const { mute } = this.state;
    this.setState({ mute: !mute });
  }

  triggerExpand = () => {
    const { fullscreen } = this.state;
    this.shouldReseek = true;
    this.setState({ fullscreen: !fullscreen }, () => {
      this.loaded = false; // reset
      this.seek(this.state.currentTime);
    });
  }

  seek(time) {
    // use `pushLoadedEvent` to make sure calling `seek` after `video.load`
    // see: https://github.com/react-native-community/react-native-video#seek
    this.pushLoadedEvent(() => {
      if (this.videoRef) {
        this.videoRef.seek(time, 0);
      }
    });
  }

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

  renderBottomControls() {
    const {
      paused,
      duration,
      currentTime,
    } = this.state;

    return (
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.buttonBase} onPress={this.triggerPlay}>
          {paused ? (
            <Image style={styles.icon} source={require('./assets/play.png')}/>
          ) : (
            <Image style={styles.icon} source={require('./assets/pause.png')}/>
          )}
        </TouchableOpacity>
        <Text style={styles.trackText}>{timeFormat(currentTime)}</Text>
        {this.renderSeekbar()}
        <Text style={styles.trackText}>-{timeFormat(duration - currentTime)}</Text>
      </View>
    );
  }

  renderTopControls() {
    const { mute } = this.state;

    return (
      <View style={styles.top}>
        <TouchableOpacity
          style={[styles.buttonBase, styles.buttonBack]}
          onPress={this.triggerExpand}
        >
          <Image style={styles.icon} source={require('./assets/expand.png')}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonBase, styles.buttonBack]}
          onPress={this.triggerVolume}
        >
          {mute ? (
            <Image style={styles.icon} source={require('./assets/volume-off.png')}/>
          ) : (
            <Image style={styles.icon} source={require('./assets/volume-up.png')}/>
          )}
        </TouchableOpacity>
      </View>
    );
  }

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
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={[styles.container, viewStyle]}>
          <Video
            key={fullscreen ? 1 : 0}
            style={[styles.video, videoStyle]}
            source={source}
            paused={seeking || paused}
            volume={mute ? 0.0 : 1.0}
            repeat={true}
            controls={false}
            onLoadStart={this.onLoadStart}
            onLoad={this.onLoad}
            onProgress={this.onProgress}
            ref={(ins) => this.videoRef = ins}
            resizeMode={resizeMode}
          />
          {this.renderTopControls()}
          {this.renderBottomControls()}
        </View>
      </TouchableWithoutFeedback>
    );
  }

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

