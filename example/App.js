/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
import Vplayer from 'react-native-vplayer';

/* eslint-disable-next-line */
console.disableYellowBox = true;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollEnabled: true
    }
  }

  // just for scrolling test
  renderLogo() {
    return (
      <View style={styles.imageWrapper}>
        <Image
          style={styles.image}
          source={{ uri: 'https://facebook.github.io/react-native/img/header_logo.png' }}
        />
      </View>
    );
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={this.state.scrollEnabled}>
        <Text style={styles.title}>Welcome to use react-native-vplayer</Text>
        <Vplayer
          style={styles.player}
          source={require('./broadchurch.mp4')}
          onFullScreen={() => { this.setState({ scrollEnabled: false })}}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  player: {
    width: 375,
    height: 250
  },
  title: {
    padding: 20,
    fontSize: 20
  },
  imageWrapper: {
    width: '100%',
    margin: 10,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#000'
  },
  image: {
    width: 198,
    height: 174
  }
});
