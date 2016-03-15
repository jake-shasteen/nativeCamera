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
import WebViewBridge from 'react-native-webview-bridge';

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
    </style>
  </head>
  <body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r74/three.min.js"></script>
    <script>
    /**
        deviceapi-normaliser.js
        
        Author: Andrew Fisher
        Date: 27/03/2013
        
        Version: 0.5
        
        This file is licensed under a BSD licence as per the Licence.
            
    **/

    var mo = {
        _browser:  null,
        _os: null,
        _ua: navigator.userAgent,
        normalise: false, 
        orientation: false,
        motion: false,

        init: function() {
            // Initialises the library to do things like device checking etc.


            var orientation = false;
            var motion = false

            // first pass.
            if (window.DeviceOrientationEvent) {
                orientation = true;
            }

            if (window.DeviceMotionEvent) {
                motion = true;
            }

            if (orientation && motion) {
                // Could be iOS, Android Stock or FF or blackberry
                if (this._ua.match(/Firefox/i) && this._ua.match(/Android/i)) {
                    // this is definitive
                    this._os = "Android";
                    this._browser = "Firefox";
                } else if (this._ua.match(/Android/i)){
                    // Stock Android
                    this._os = "Android";
                    this._browser = "Stock";
                } else if (this._ua.match(/Blackberry|RIM/i)){
                    //blackberry
                    this._os = "Blackberry";
                    this._browser = "Stock";
                } else {
                    this._os = "iOS";
                    this._browser = "webkit";
                }
            } else if (orientation && !motion) {
                // It's chrome but is it desktop or mobile?
                this._browser = "Chrome";
                if (this._ua.match(/Android/i)){
                    this._os = "Android";
                } else {
                    this._os = "Desktop";
                }
            } else if (!orientation) {

                // this is something very odd
                this._browser = "Unknown";
                this._os = "Unknown";
            }

            // TODO - actually set these properly.
            this.orientation = orientation;
            this.motion = motion;
        },
    }



    // set up some constants
    var accel_multi = 1; // used to normalise the accel values if firefox

    $(function() {
        ;
    });

    function deviceMotion(e) {

        

      // we need to normalise the values, safari will just return
      // as they are but ff will multiply by gravity.
        this.accelerationIncludingGravity = new Object();
        this.accelerationIncludingGravity.x = e.accelerationIncludingGravity.x;
        this.accelerationIncludingGravity.y = e.accelerationIncludingGravity.y;
        this.accelerationIncludingGravity.z = e.accelerationIncludingGravity.z;
        
        this.acceleration = new Object();
        if (e.acceleration !== null) {
            this.acceleration.x = e.acceleration.x;
            this.acceleration.y = e.acceleration.y;
            this.acceleration.z = e.acceleration.z;
        } else {
            this.acceleration.x = null;
            this.acceleration.y = null;
            this.acceleration.z = null;
        }
        
        this.rotationRate = new Object();
        if (e.rotationRate !== null) {
            this.rotationRate.alpha = e.rotationRate.alpha;
            this.rotationRate.beta = e.rotationRate.beta;
            this.rotationRate.gamma = e.rotationRate.gamma;
        } else {
            this.rotationRate.alpha = null;
            this.rotationRate.beta = null;
            this.rotationRate.gamma = null;
        }

        this.interval = null;
        if (e.interval !== null) { this.interval = e.interval; }

        return (this);
    }

    function deviceOrientation(e) {
        
        // normalise the values for the orientation event.
        
        // TODO:
        // these values need further normalisation because I know safari
        // breaks them but haven't got a device to test with.
        
      this.gamma = e.gamma;
      this.beta = e.beta;
      this.alpha = e.alpha; // compass

        this.absolute = false;
        if (e.absolute !== null) { this.absolute = e.absolute; }

      return(this);
      
    }

    </script>
    <script>
      var camera, scene, renderer;
      var controls;
      var mesh;

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

        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;

        renderer.render( scene, camera );

      }
    </script>
    <script>
      window.addEventListener("deviceorientation", function( e ) {
        var obj = deviceOrientation( e );

        camera.rotation.x = obj.alpha * Math.PI / 180;
      }
    </script>
  </body>
</html>
`;

const injectScript = `
  function webViewBridgeReady(cb) {
    //checks whether WebViewBirdge exists in global scope.
    if (window.WebViewBridge) {
      cb(window.WebViewBridge);
      return;
    }

    function handler() {
      //remove the handler from listener since we don't need it anymore
      document.removeEventListener('WebViewBridge', handler, false);
      //pass the WebViewBridge object to the callback
      cb(window.WebViewBridge);
    }

    //if WebViewBridge doesn't exist in global scope attach itself to document
    //event system. Once the code is being injected by extension, the handler will
    //be called.
    document.addEventListener('WebViewBridge', handler, false);
  }

  webViewBridgeReady(function (webViewBridge) {
    webViewBridge.onMessage = function (message) {
      mesh.position.x = parseInt( JSON.parse( message ).x );

      // webViewBridge.send("message from webview");
    };
  });
`;


class nativeCamera extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}>
        </Camera>
        <View style={styles.webviewcont}>
          <WebViewBridge 
            ref="webviewbridge"
            automaticallyAdjustContentInsets={true}
            source={{ html: HTML }}
            style={styles.webView}
            injectedJavaScript={injectScript}
            javaScriptEnabled={true}
            scalesPageToFit={true}
          />
        </View>
      </View>
    );
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
  webviewcont: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    backgroundColor: 'transparent'
  },
  webView: {
    backgroundColor: 'transparent'
  }
});

AppRegistry.registerComponent('nativeCamera', () => nativeCamera);
