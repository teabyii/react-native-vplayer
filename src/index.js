import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';

const styles = StyleSheet.create({
  video: {
    marginTop: 50,
    width: 375,
    height: 250
  }
});

export default class Vplayer extends Component {
  static propTypes = {
    source: PropTypes.any
  }

  render() {
    const { source } = this.props;

    return (
      <Video
        style={styles.video}
        source={source}
        controls
      />
    );
  }
}

