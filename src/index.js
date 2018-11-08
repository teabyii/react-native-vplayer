import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity
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

// 全屏播放
// 音量控制
// 进度控制
// 播放暂停控制
export default class Vplayer extends Component {
  static propTypes = {
    source: PropTypes.any,
    style: PropTypes.any,
    videoStyle: PropTypes.any
  }

  constructor(props) {
    super(props);

    this.state = {

    };
  }

  renderSeekbar() {
    return (
      <View style={styles.seekbar}>
        <View style={styles.baseTrack} />
        <View style={[styles.baseTrack, styles.fillTrack, { width: '30%' }]} />
        <View style={[styles.seeker, { left: '30%' }]} />
      </View>
    );
  }

  renderBottomControls() {
    return (
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.buttonBase}>
          <Image style={styles.icon} source={require('./assets/play.png')}/>
        </TouchableOpacity>
        <Text style={styles.trackText}>0:40</Text>
        {this.renderSeekbar()}
        <Text style={styles.trackText}>-0:07</Text>
      </View>
    );
  }

  renderTopControls() {
    return (
      <View style={styles.top}>
        <TouchableOpacity style={[styles.buttonBase, styles.buttonBack]}>
          <Image style={styles.icon} source={require('./assets/expand.png')}/>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonBase, styles.buttonBack]}>
          <Image style={styles.icon} source={require('./assets/volume-off.png')}/>
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

    return (
      <View style={[styles.container, style]}>
        <Video
          style={[styles.video, videoStyle]}
          source={source}
          controls
        />
        {this.renderTopControls()}
        {this.renderBottomControls()}
      </View>
    );
  }
}

