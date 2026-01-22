#!/bin/bash

# Install missing React Native Android dependencies

echo "Installing missing React Native dependencies..."

# Core CLI package that includes cli-platform-android
npm install --save-dev @react-native-community/cli@latest

# React Native Gradle Plugin
npm install --save-dev @react-native/gradle-plugin@latest

# Vector Icons (already referenced in build.gradle)
npm install --save-dev react-native-vector-icons

echo "Dependencies installed successfully!"
echo ""
echo "Now you can build with:"
echo "  cd android && ./gradlew assembleRelease"
