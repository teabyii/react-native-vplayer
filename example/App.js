/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import Vplayer from 'react-native-vplayer';

export default class App extends Component {
  render() {
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Vplayer
            style={styles.player}
            source={require('./broadchurch.mp4')}
          />
        </View>
      </SafeAreaView>
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
