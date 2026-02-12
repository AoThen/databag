# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# WebRTC
-keep class org.webrtc.** { *; }

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
    public static *** e(...);
}

# Obfuscate API endpoints
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# React Native
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# CryptoJS
-keep class org.crypto-js.** { *; }
-dontwarn org.crypto-js.**

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# SQLite
-keep class org.pgsql.** { *; }
-dontwarn org.pgsql.**

# Obfuscate sensitive class names
-keep class com.databag.context.** { *; }
-keep class com.databag.api.** { *; }
