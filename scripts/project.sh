#!/bin/bash

#Copyright (c) 2015 Jonathan Dixon.

#Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

#The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#https://gist.github.com/jonathandixon/7043297

# ----
# Text Colors and Messaging Functions


read -r -p "Would you like to clear out platforms, plugins and www, then rebuild? (Y/n)"
if [[ $response =~ ^(yes|y| ) ]] | [ -z $response ]; then
    echo "Rebuilding...."
    rm -rf ./platforms
    rm -rf ./plugins
    rm -rf ./www
    webpack --config ./webpack.dist.config.js
fi

textReset=$(tput sgr0)
textRed=$(tput setaf 1)
textGreen=$(tput setaf 2)
textYellow=$(tput setaf 3)

message_info () {
    echo "$textGreen[project]$textReset $1"
}
message_warn () {
    echo "$textYellow[project]$textReset $1"
}
message_error () {
    echo "$textRed[project]$textReset $1"
}

# ----
# Help Output

show_help () {
        echo ""
        message_info "This script performs the necessary command-line operations for this app."
        message_info ""
        message_info "The following options are available:"
        message_info ""
        message_info "    -c (--clean): Removes generated directories and content. Combine with -i."
        message_info "    -h (--help): Displays this help message."
        message_info "    -i (--init): Runs all operations necessary for initialization."
        message_info "    -m (--merge): Merges content of 'platform-merges' with 'platform'."
        message_info "    -n (--icons): Copies icon and splash screen images to platform directories."
        message_info "    -p (--plugins): (Re)Installs all plugins."
        message_info "    -u (--update): Update platform codebase, runs 'cordova prepare'."
        message_info ""
        message_info "Examples:"
        message_info ""
        message_info "    ./project.sh   # This is the same as using the -i option."
        message_info "    ./project.sh -c -i"
        echo ""
}

# ----
# Script Option Parsing

init=0;
merge=0;
plugins=0;
icons=0;
clean=0;
update=0;

while :; do
        case $1 in
                -h | --help | -\?)
                        show_help
                        exit 0
                        ;;
                -i | --init)
                        init=1
                        ;;
                -m | --merge)
                        merge=1
                        ;;
                -p | --plugins)
                        plugins=1
                        ;;
                -n | --icons)
                        icons=1
                        ;;
                -c | --clean)
                        clean=1
                        ;;
                -u | --update)
                        update=1
                        ;;
                --) # End of all options
                        break
                        ;;
                -*)
                        echo ""
                        message_error "WARN: Unknown option (ignored): $1"
                        show_help
                        exit 1
                        ;;
                *)  # no more options. Stop while loop
                        break
                        ;;
        esac
        shift
done

if [[ $merge = 0 ]] && [[ $plugins = 0 ]] && [[ $icons = 0 ]] && [[ $clean = 0 ]] && [[ $update = 0 ]] ; then
        # If no options specified then we're doing initialization.
        init=1
fi

# ----
# Clean

if [[ $clean = 1 ]] ; then
        if [[ -d "plugins" ]] ; then
                message_info "Removing 'plugins' directory."
                rm -rf plugins
        fi

        if [[ -d "platforms" ]] ; then
                message_info "Removing 'platforms' directory."
                rm -rf platforms
        fi
fi

if [[ $merge = 0 ]] && [[ $plugins = 0 ]] && [[ $icons = 0 ]] && [[ $init = 0 ]] && [[ $update = 0 ]] ; then
        exit 0
fi

# ----
# Make sure necessary directories exist, regardless of options.

if [[ ! -d "plugins" ]] ; then
        message_info "Creating 'plugins' directory."
        mkdir plugins
fi

if [[ ! -d "platforms" ]] ; then
        message_info "Creating 'platforms' directory."
        mkdir platforms
fi

# ----
# Add platforms

if [[ $init = 1 ]] ; then
        # TODO Check if platforms have already been added
        # 'cordova platforms'

        message_info "Adding Android platform..."
        cordova platform add android

        message_info "Adding iOS platform..."
        cordova platform add ios
fi

# ----
# Merge platform overrides.

if [[ $init = 1 ]] || [[ $merge = 1 ]] ; then
        message_info "Merging Android platform customizations..."
        cp -R platform-merges/android/* platforms/android/

        message_info "Merging iOS platform customizations..."
        cp -R platform-merges/ios/* platforms/ios/
fi

# ----
# Copy App Icons and Splash Screen Images

if [[ $init = 1 ]] || [[ $icons = 1 ]] ; then
        # This would probably be better if we parsed www/config.xml,
        # but for now we know the files and where they need to go.

        message_info "Copying Android app icons and splash screen images..."
        cp www/images/icon/36x36.png platforms/android/res/mipmap-ldpi/icon.png
        cp www/images/icon/48x48.png platforms/android/res/mipmap-mdpi/icon.png
        cp www/images/icon/72x72.png platforms/android/res/mipmap-hdpi/icon.png
        cp www/images/icon/96x96.png platforms/android/res/mipmap-xhdpi/icon.png

        cp www/images/splash/320x426.png platforms/android/res/drawable-port-ldpi/screen.png
        cp www/images/splash/320x470.png platforms/android/res/drawable-port-mdpi/screen.png
        cp www/images/splash/480x640.png platforms/android/res/drawable-port-hdpi/screen.png
        cp www/images/splash/720x960.png platforms/android/res/drawable-port-xhdpi/screen.png
        # These will show up sideways. Whatever.
        cp www/images/splash/320x426.png platforms/android/res/drawable-land-ldpi/screen.png
        cp www/images/splash/320x470.png platforms/android/res/drawable-land-mdpi/screen.png
        cp www/images/splash/480x640.png platforms/android/res/drawable-land-hdpi/screen.png
        cp www/images/splash/720x960.png platforms/android/res/drawable-land-xhdpi/screen.png

        message_info "Copying iOS app icons and splash screen images..."
        cp www/images/icon/40x40.png platforms/ios/Expedition/Images.xcassets/AppIcon.appiconset/icon-40.png
        cp www/images/icon/80x80.png platforms/ios/Expedition/Images.xcassets/AppIcon.appiconset/icon-40@2x.png
        cp www/images/icon/57x57.png platforms/ios/Expedition/Images.xcassets/AppIcon.appiconset/icon.png
        cp www/images/icon/114x114.png platforms/ios/Expedition/Images.xcassets/AppIcon.appiconset/icon@2x.png
        cp www/images/icon/72x72.png platforms/ios/Expedition/Images.xcassets/AppIcon.appiconset/icon-72.png
        cp www/images/icon/144x144.png platforms/ios/Expedition/Images.xcassets/AppIcon.appiconset/icon-72@2x.png

        cp www/images/splash/640x960.png platforms/ios/Expedition/Images.xcassets/LaunchImage.launchimage/Default~iphone.png
        cp www/images/splash/750x1334.png platforms/ios/Expedition/Images.xcassets/LaunchImage.launchimage/Default@2x~iphone.png
        cp www/images/splash/640x1136.png platforms/ios/Expedition/Images.xcassets/LaunchImage.launchimage/Default-568h@2x~iphone.png
        cp www/images/splash/768x1024.png platforms/ios/Expedition/Images.xcassets/LaunchImage.launchimage/Default-Portrait~ipad.png
        cp www/images/splash/1536x2048.png platforms/ios/Expedition/Images.xcassets/LaunchImage.launchimage/Default-Portrait@2x~ipad.png
        # These will show up sideways. Whatever.
        cp www/images/splash/768x1024.png platforms/ios/Expedition/Images.xcassets/LaunchImage.launchimage/Default-Landscape~ipad.png
        cp www/images/splash/1536x2048.png platforms/ios/Expedition/Images.xcassets/LaunchImage.launchimage/Default-Landscape@2x~ipad.png
fi

# ----
# Prepare Platforms
if [[ $init = 1 ]] || [[ $update = 1 ]] ; then
        message_info "Syncing 'www' with Android platform..."
        cordova prepare android

        message_info "Syncing 'www' with iOS platform..."
        cordova prepare ios
fi
