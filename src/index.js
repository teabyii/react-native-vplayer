import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import Video from 'react-native-video';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    justifyContent: 'space-between',
    overflow: "hidden"
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
    width: 10,
    height: 10,
    marginLeft: -5,
    marginTop: -2,
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
      currentTime: 0,
      remainingTime: 0,
    };
  }

  onPlayOrPause = () => {
    const { paused } = this.state;
    this.setState({ paused: !paused });
  }

  onProgress = (e) => {
    const { currentTime, seekableDuration } = e || { currentTime: 0, seekableDuration: 0 };
    const remainingTime = seekableDuration - currentTime;

    this.setState({
      currentTime,
      remainingTime
    });
  }

  triggerVolume = () => {
    const { mute } = this.state;
    this.setState({ mute: !mute });
  }

  renderSeekbar() {
    const { currentTime, remainingTime } = this.state;
    const fillWidth = (currentTime / (currentTime + remainingTime) * 100).toFixed(0);

    return (
      <View style={styles.seekbar}>
        <View style={styles.baseTrack} />
        <View style={[styles.baseTrack, styles.fillTrack, { width: `${fillWidth}%` }]} />
        <View style={[styles.seeker, { left: `${fillWidth}%` }]} />
      </View>
    );
  }

  renderBottomControls() {
    const {
      paused,
      currentTime,
      remainingTime,
    } = this.state;

    return (
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.buttonBase} onPress={this.onPlayOrPause}>
          {paused ? (
            <Image style={styles.icon} source={require('./assets/play.png')}/>
          ) : (
            <Image style={styles.icon} source={require('./assets/pause.png')}/>
          )}
        </TouchableOpacity>
        <Text style={styles.trackText}>{timeFormat(currentTime)}</Text>
        {this.renderSeekbar()}
        <Text style={styles.trackText}>-{timeFormat(remainingTime)}</Text>
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

  render() {
    const {
      source,
      style,
      videoStyle,
    } = this.props;
    const {
      paused,
      mute
    } = this.state;

    return (
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={[styles.container, style]}>
          <Video
            style={[styles.video, videoStyle]}
            source={source}
            paused={paused}
            volume={mute ? 0.0 : 1.0}
            repeat={true}
            controls={false}
            onProgress={this.onProgress}
          />
          {this.renderTopControls()}
          {this.renderBottomControls()}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

