#!/bin/bash

./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n co.noQuarter.crow/host.exp.exponent.MainActivity
