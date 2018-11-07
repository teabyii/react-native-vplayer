/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import Video from 'react-native-video';

export default class App extends Component {
  render() {
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Video 
            style={styles.video}
            source={require('./broadchurch.mp4')} 
            controls
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
  video: {
    marginTop: 50,
    width: 375,
    height: 250
  }
});
