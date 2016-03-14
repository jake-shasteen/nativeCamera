/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  Dimensions,
  StyleSheet,
  Image,
  Text,
  TouchableHighlight,
  View,
  WebView
} from 'react-native';
import Camera from 'react-native-camera';

const WEBVIEW_REF = 'webview';
const BGWASH = 'rgba(255,255,0,1.0)';

class nativeCamera extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.preview}
          source={{uri: 'http://facebook.github.io/react/img/logo_og.png'}}
        />
        <View style={styles.webviewcont}>
          <WebView 
            ref={WEBVIEW_REF}
            automaticallyAdjustContentInsets={true}
            source={{ html: '' }}
            style={styles.webView}
            javaScriptEnabled={true}
            scalesPageToFit={true}
          />
        </View>
      </View>
    );
  }

  takePicture() {
    this.camera.capture()
      .then((data) => console.log(data))
      .catch(err => console.error(err));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  preview: {
    position: 'absolute',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  },
  webviewcont: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    backgroundColor: 'rgba(255,0,0,0.5)'
  },
  webView: {
    position: 'absolute'
  }
});

AppRegistry.registerComponent('nativeCamera', () => nativeCamera);
