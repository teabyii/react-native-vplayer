/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Vplayer from 'react-native-vplayer';

/* eslint-disable-next-line */
console.disableYellowBox = true;

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Vplayer
          style={styles.player}
          source={require('./broadchurch.mp4')}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  player: {
    width: 375,
    height: 250
  }
});
