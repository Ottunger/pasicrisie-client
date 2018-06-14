# Pasicrisie - Elastic search

This project compiles to Pasicrisie search application

# Build process
You might want to read this file as plain text.

To emulate:
ionic cordova emulate android

"C:\Program Files\Java\jdk1.8.0_151\bin\keytool" -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mykey
"C:\Program Files\Java\jdk1.8.0_151\bin\jarsigner" -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-key.jks platforms\android\build\outputs\apk\android-release-unsigned.apk mykey
"C:\Users\mathongr\AppData\Local\Android\Sdk\build-tools\25.0.0\zipalign" -v 4 platforms\android\build\outputs\apk\android-release-unsigned.apk platforms\android\build\outputs\apk\PES.apk
