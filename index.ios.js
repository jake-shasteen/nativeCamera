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

const HTML = `
<!DOCTYPE html>\n
<html>
  <head>
    <title>Hello Static World</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=320, user-scalable=no">
    <style type="text/css">
      * {
        margin: 0;
        border: solid red 1px;
      }
      body {
        margin: 0;
        padding: 0;
        font: 62.5% arial, sans-serif;
        background: transparent;
      }
      h1 {
        top: 10px;
        padding: 45px;
        margin: 0;
        text-align: center;
        color: #000;
      }
    </style>
  </head>
  <body>
    <p> This is my content. It is now showing up. </p>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r74/three.min.js"></script>
    <script>    var camera, scene, renderer;
      var mesh;
      var x = 0;

      init();
      animate();

      function init() {

        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.z = 400;

        scene = new THREE.Scene();

        var texture = new THREE.TextureLoader().load( 'http://mrdoob.github.io/three.js/examples/textures/crate.gif', function() {}, function() {}, function( xhr ) {
          alert( 'an error happened' );
        } );

        var geometry = new THREE.BoxGeometry( 50, 50, 50 );
        var material = new THREE.MeshBasicMaterial( { map: texture } );

        mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      function animate() {

        requestAnimationFrame( animate );

       if( x ) {
          mesh.position.x = x;
       }

        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;

        renderer.render( scene, camera );

      }
    </script>
  </body>
</html>
`;

/*
        <Image
          style={styles.preview}
          source={{uri: 'http://facebook.github.io/react/img/logo_og.png'}}
        />
        <View style={styles.webviewcont}>
          <WebView 
            ref={WEBVIEW_REF}
            automaticallyAdjustContentInsets={true}
            source={{ html: HTML }}
            style={styles.webView}
            javaScriptEnabled={true}
            scalesPageToFit={true}
          />
        </View>
        */

class nativeCamera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0
    };
  }

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
            source={{ html: HTML }}
            style={styles.webView}
            injectedJavaScript={'x = ' + this.state.x }
            javaScriptEnabled={true}
            scalesPageToFit={true}
          />
        </View>
        <Text style={styles.capture} onClick={this.move.bind(this)}>[MOVE]</Text>
      </View>
    );
  }

  move() {
    this.setState({ x: 100 });
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
    position: 'absolute',
    top: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  },
  webviewcont: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    backgroundColor: 'rgba(255,0,0,0.2)'
  },
  webView: {
    backgroundColor: 'transparent'
  }
});

AppRegistry.registerComponent('nativeCamera', () => nativeCamera);
