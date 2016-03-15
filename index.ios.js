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
     * -------
     * threeVR (https://github.com/richtr/threeVR)
     * -------
     *
     * W3C Device Orientation control (http://www.w3.org/TR/orientation-event/)
     * with manual user drag (rotate) and pinch (zoom) override handling
     *
     * Author: Rich Tibbett (http://github.com/richtr)
     * License: The MIT License
     *
    **/

    var DeviceOrientationController = function ( object, domElement ) {

      this.object = object;
      this.element = domElement || document;

      this.freeze = true;

      this.enableManualDrag = true; // enable manual user drag override control by default
      this.enableManualZoom = true; // enable manual user zoom override control by default

      this.useQuaternions = true; // use quaternions for orientation calculation by default

      this.deviceOrientation = {};
      this.screenOrientation = window.orientation || 0;

      // Manual rotate override components
      var startX = 0, startY = 0,
          currentX = 0, currentY = 0,
          scrollSpeedX, scrollSpeedY,
          tmpQuat = new THREE.Quaternion();

      // Manual zoom override components
      var zoomStart = 1, zoomCurrent = 1,
          zoomP1 = new THREE.Vector2(),
          zoomP2 = new THREE.Vector2(),
          tmpFOV;

      var CONTROLLER_STATE = {
        AUTO: 0,
        MANUAL_ROTATE: 1,
        MANUAL_ZOOM: 2
      };

      var appState = CONTROLLER_STATE.AUTO;

      var CONTROLLER_EVENT = {
        CALIBRATE_COMPASS:  'compassneedscalibration',
        SCREEN_ORIENTATION: 'orientationchange',
        MANUAL_CONTROL:     'userinteraction', // userinteractionstart, userinteractionend
        ZOOM_CONTROL:       'zoom',            // zoomstart, zoomend
        ROTATE_CONTROL:     'rotate',          // rotatestart, rotateend
      };

      // Consistent Object Field-Of-View fix components
      var startClientHeight = window.innerHeight,
          startFOVFrustrumHeight = 2000 * Math.tan( THREE.Math.degToRad( ( this.object.fov || 75 ) / 2 ) ),
          relativeFOVFrustrumHeight, relativeVerticalFOV;

      var deviceQuat = new THREE.Quaternion();

      var fireEvent = function () {
        var eventData;

        return function ( name ) {
          eventData = arguments || {};

          eventData.type = name;
          eventData.target = this;

          this.dispatchEvent( eventData );
        }.bind( this );
      }.bind( this )();

      this.constrainObjectFOV = function () {
        relativeFOVFrustrumHeight = startFOVFrustrumHeight * ( window.innerHeight / startClientHeight );

        relativeVerticalFOV = THREE.Math.radToDeg( 2 * Math.atan( relativeFOVFrustrumHeight / 2000 ) );

        this.object.fov = relativeVerticalFOV;
      }.bind( this );

      this.onDeviceOrientationChange = function ( event ) {
        this.deviceOrientation = event;
      }.bind( this );

      this.onScreenOrientationChange = function () {
        this.screenOrientation = window.orientation || 0;

        fireEvent( CONTROLLER_EVENT.SCREEN_ORIENTATION );
      }.bind( this );

      this.onCompassNeedsCalibration = function ( event ) {
        event.preventDefault();

        fireEvent( CONTROLLER_EVENT.CALIBRATE_COMPASS );
      }.bind( this );

      this.onDocumentMouseDown = function ( event ) {
        if ( this.enableManualDrag !== true ) return;

        event.preventDefault();

        appState = CONTROLLER_STATE.MANUAL_ROTATE;

        this.freeze = true;

        tmpQuat.copy( this.object.quaternion );

        startX = currentX = event.pageX;
        startY = currentY = event.pageY;

        // Set consistent scroll speed based on current viewport width/height
        scrollSpeedX = ( 1200 / window.innerWidth ) * 0.2;
        scrollSpeedY = ( 800 / window.innerHeight ) * 0.2;

        this.element.addEventListener( 'mousemove', this.onDocumentMouseMove, false );
        this.element.addEventListener( 'mouseup', this.onDocumentMouseUp, false );

        fireEvent( CONTROLLER_EVENT.MANUAL_CONTROL + 'start' );
        fireEvent( CONTROLLER_EVENT.ROTATE_CONTROL + 'start' );
      }.bind( this );

      this.onDocumentMouseMove = function ( event ) {
        currentX = event.pageX;
        currentY = event.pageY;
      }.bind( this );

      this.onDocumentMouseUp = function ( event ) {
        this.element.removeEventListener( 'mousemove', this.onDocumentMouseMove, false );
        this.element.removeEventListener( 'mouseup', this.onDocumentMouseUp, false );

        appState = CONTROLLER_STATE.AUTO;

        this.freeze = false;

        fireEvent( CONTROLLER_EVENT.MANUAL_CONTROL + 'end' );
        fireEvent( CONTROLLER_EVENT.ROTATE_CONTROL + 'end' );
      }.bind( this );

      this.onDocumentTouchStart = function ( event ) {
        event.preventDefault();
        event.stopPropagation();

        switch ( event.touches.length ) {
          case 1: // ROTATE
            if ( this.enableManualDrag !== true ) return;

            appState = CONTROLLER_STATE.MANUAL_ROTATE;

            this.freeze = true;

            tmpQuat.copy( this.object.quaternion );

            startX = currentX = event.touches[ 0 ].pageX;
            startY = currentY = event.touches[ 0 ].pageY;

            // Set consistent scroll speed based on current viewport width/height
            scrollSpeedX = ( 1200 / window.innerWidth ) * 0.1;
            scrollSpeedY = ( 800 / window.innerHeight ) * 0.1;

            this.element.addEventListener( 'touchmove', this.onDocumentTouchMove, false );
            this.element.addEventListener( 'touchend', this.onDocumentTouchEnd, false );

            fireEvent( CONTROLLER_EVENT.MANUAL_CONTROL + 'start' );
            fireEvent( CONTROLLER_EVENT.ROTATE_CONTROL + 'start' );

            break;

          case 2: // ZOOM
            if ( this.enableManualZoom !== true ) return;

            appState = CONTROLLER_STATE.MANUAL_ZOOM;

            this.freeze = true;

            tmpFOV = this.object.fov;

            zoomP1.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
            zoomP2.set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY );

            zoomStart = zoomCurrent = zoomP1.distanceTo( zoomP2 );

            this.element.addEventListener( 'touchmove', this.onDocumentTouchMove, false );
            this.element.addEventListener( 'touchend', this.onDocumentTouchEnd, false );

            fireEvent( CONTROLLER_EVENT.MANUAL_CONTROL + 'start' );
            fireEvent( CONTROLLER_EVENT.ZOOM_CONTROL + 'start' );

            break;
        }
      }.bind( this );

      this.onDocumentTouchMove = function ( event ) {
        switch( event.touches.length ) {
          case 1:
            currentX = event.touches[ 0 ].pageX;
            currentY = event.touches[ 0 ].pageY;
            break;

          case 2:
            zoomP1.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
            zoomP2.set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY );
            break;
        }
      }.bind( this );

      this.onDocumentTouchEnd = function ( event ) {
        this.element.removeEventListener( 'touchmove', this.onDocumentTouchMove, false );
        this.element.removeEventListener( 'touchend', this.onDocumentTouchEnd, false );

        if ( appState === CONTROLLER_STATE.MANUAL_ROTATE ) {

          appState = CONTROLLER_STATE.AUTO; // reset control state

          this.freeze = false;

          fireEvent( CONTROLLER_EVENT.MANUAL_CONTROL + 'end' );
          fireEvent( CONTROLLER_EVENT.ROTATE_CONTROL + 'end' );

        } else if ( appState === CONTROLLER_STATE.MANUAL_ZOOM ) {

          this.constrainObjectFOV(); // re-instate original object FOV

          appState = CONTROLLER_STATE.AUTO; // reset control state

          this.freeze = false;

          fireEvent( CONTROLLER_EVENT.MANUAL_CONTROL + 'end' );
          fireEvent( CONTROLLER_EVENT.ZOOM_CONTROL + 'end' );

        }
      }.bind( this );

      var createQuaternion = function () {

        var finalQuaternion = new THREE.Quaternion();

        var deviceEuler = new THREE.Euler();

        var screenTransform = new THREE.Quaternion();

        var worldTransform = new THREE.Quaternion( - Math.sqrt(0.5), 0, 0, Math.sqrt(0.5) ); // - PI/2 around the x-axis

        var minusHalfAngle = 0;

        return function ( alpha, beta, gamma, screenOrientation ) {

          deviceEuler.set( beta, alpha, - gamma, 'YXZ' );

          finalQuaternion.setFromEuler( deviceEuler );

          minusHalfAngle = - screenOrientation / 2;

          screenTransform.set( 0, Math.sin( minusHalfAngle ), 0, Math.cos( minusHalfAngle ) );

          finalQuaternion.multiply( screenTransform );

          finalQuaternion.multiply( worldTransform );

          return finalQuaternion;

        }

      }();

      var createRotationMatrix = function () {

        var finalMatrix = new THREE.Matrix4();

        var deviceEuler = new THREE.Euler();
        var screenEuler = new THREE.Euler();
        var worldEuler = new THREE.Euler( - Math.PI / 2, 0, 0, 'YXZ' ); // - PI/2 around the x-axis

        var screenTransform = new THREE.Matrix4();

        var worldTransform = new THREE.Matrix4();
        worldTransform.makeRotationFromEuler(worldEuler);

        return function (alpha, beta, gamma, screenOrientation) {

          deviceEuler.set( beta, alpha, - gamma, 'YXZ' );

          finalMatrix.identity();

          finalMatrix.makeRotationFromEuler( deviceEuler );

          screenEuler.set( 0, - screenOrientation, 0, 'YXZ' );

          screenTransform.identity();

          screenTransform.makeRotationFromEuler( screenEuler );

          finalMatrix.multiply( screenTransform );

          finalMatrix.multiply( worldTransform );

          return finalMatrix;

        }

      }();

      this.updateManualMove = function () {

        var lat, lon;
        var phi, theta;

        var rotation = new THREE.Euler( 0, 0, 0, 'YXZ' );

        var rotQuat = new THREE.Quaternion();
        var objQuat = new THREE.Quaternion();

        var tmpZ, objZ, realZ;

        var zoomFactor, minZoomFactor = 1; // maxZoomFactor = Infinity

        return function () {

          objQuat.copy( tmpQuat );

          if ( appState === CONTROLLER_STATE.MANUAL_ROTATE ) {

            lat = ( startY - currentY ) * scrollSpeedY;
            lon = ( startX - currentX ) * scrollSpeedX;

            phi  = THREE.Math.degToRad( lat );
            theta = THREE.Math.degToRad( lon );

            rotQuat.set( 0, Math.sin( theta / 2 ), 0, Math.cos( theta / 2 ) );

            objQuat.multiply( rotQuat );

            rotQuat.set( Math.sin( phi / 2 ), 0, 0, Math.cos( phi / 2 ) );

            objQuat.multiply( rotQuat );

            // Remove introduced z-axis rotation and add device's current z-axis rotation

            tmpZ  = rotation.setFromQuaternion( tmpQuat, 'YXZ' ).z;
            objZ  = rotation.setFromQuaternion( objQuat, 'YXZ' ).z;
            realZ = rotation.setFromQuaternion( deviceQuat || tmpQuat, 'YXZ' ).z;

            rotQuat.set( 0, 0, Math.sin( ( realZ - tmpZ  ) / 2 ), Math.cos( ( realZ - tmpZ ) / 2 ) );

            tmpQuat.multiply( rotQuat );

            rotQuat.set( 0, 0, Math.sin( ( realZ - objZ  ) / 2 ), Math.cos( ( realZ - objZ ) / 2 ) );

            objQuat.multiply( rotQuat );

            this.object.quaternion.copy( objQuat );

          } else if ( appState === CONTROLLER_STATE.MANUAL_ZOOM ) {

            zoomCurrent = zoomP1.distanceTo( zoomP2 );

            zoomFactor = zoomStart / zoomCurrent;

            if ( zoomFactor <= minZoomFactor ) {

              this.object.fov = tmpFOV * zoomFactor;

              this.object.updateProjectionMatrix();

            }

            // Add device's current z-axis rotation

            if ( deviceQuat ) {

              tmpZ  = rotation.setFromQuaternion( tmpQuat, 'YXZ' ).z;
              realZ = rotation.setFromQuaternion( deviceQuat, 'YXZ' ).z;

              rotQuat.set( 0, 0, Math.sin( ( realZ - tmpZ ) / 2 ), Math.cos( ( realZ - tmpZ ) / 2 ) );

              tmpQuat.multiply( rotQuat );

              this.object.quaternion.copy( tmpQuat );

            }

          }

        };

      }();

      this.updateDeviceMove = function () {

        var alpha, beta, gamma, orient;

        var deviceMatrix;

        return function () {

          alpha  = THREE.Math.degToRad( this.deviceOrientation.alpha || 0 ); // Z
          beta   = THREE.Math.degToRad( this.deviceOrientation.beta  || 0 ); // X'
          gamma  = THREE.Math.degToRad( this.deviceOrientation.gamma || 0 ); // Y''
          orient = THREE.Math.degToRad( this.screenOrientation       || 0 ); // O

          // only process non-zero 3-axis data
          if ( alpha !== 0 && beta !== 0 && gamma !== 0) {

            if ( this.useQuaternions ) {

              deviceQuat = createQuaternion( alpha, beta, gamma, orient );

            } else {

              deviceMatrix = createRotationMatrix( alpha, beta, gamma, orient );

              deviceQuat.setFromRotationMatrix( deviceMatrix );

            }

            if ( this.freeze ) return;

            //this.object.quaternion.slerp( deviceQuat, 0.07 ); // smoothing
            this.object.quaternion.copy( deviceQuat );

          }

        };

      }();

      this.update = function () {
        this.updateDeviceMove();

        if ( appState !== CONTROLLER_STATE.AUTO ) {
          this.updateManualMove();
        }
      };

      this.connect = function () {
        window.addEventListener( 'resize', this.constrainObjectFOV, false );

        window.addEventListener( 'orientationchange', this.onScreenOrientationChange, false );
        window.addEventListener( 'deviceorientation', this.onDeviceOrientationChange, false );

        window.addEventListener( 'compassneedscalibration', this.onCompassNeedsCalibration, false );

        this.element.addEventListener( 'mousedown', this.onDocumentMouseDown, false );
        this.element.addEventListener( 'touchstart', this.onDocumentTouchStart, false );

        this.freeze = false;
      };

      this.disconnect = function () {
        this.freeze = true;

        window.removeEventListener( 'resize', this.constrainObjectFOV, false );

        window.removeEventListener( 'orientationchange', this.onScreenOrientationChange, false );
        window.removeEventListener( 'deviceorientation', this.onDeviceOrientationChange, false );

        window.removeEventListener( 'compassneedscalibration', this.onCompassNeedsCalibration, false );

        this.element.removeEventListener( 'mousedown', this.onDocumentMouseDown, false );
        this.element.removeEventListener( 'touchstart', this.onDocumentTouchStart, false );
      };

    };

    DeviceOrientationController.prototype = Object.create( THREE.EventDispatcher.prototype );
    </script>
    <script>    var camera, scene, renderer;
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
        controls = new DeviceOrientationController( camera, renderer.domElement );
        controls.connect();

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
