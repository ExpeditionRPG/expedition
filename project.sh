#!/bin/bash

#Copyright (c) 2015 Jonathan Dixon.

#Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

#The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#https://gist.github.com/jonathandixon/7043297

# ----
# Text Colors and Messaging Functions

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
        cp www/res/icon/android/icon-36-ldpi.png platforms/android/res/drawable-ldpi/icon.png
        cp www/res/icon/android/icon-48-mdpi.png platforms/android/res/drawable-mdpi/icon.png
        cp www/res/icon/android/icon-72-hdpi.png platforms/android/res/drawable-hdpi/icon.png
        cp www/res/icon/android/icon-96-xhdpi.png platforms/android/res/drawable-xhdpi/icon.png
        cp www/res/icon/android/icon-96-xhdpi.png platforms/android/res/drawable/icon.png

        cp www/res/screen/android/screen-ldpi-portrait.png platforms/android/res/drawable-ldpi/screen.png
        cp www/res/screen/android/screen-mdpi-portrait.png platforms/android/res/drawable-mdpi/screen.png
        cp www/res/screen/android/screen-hdpi-portrait.png platforms/android/res/drawable-hdpi/screen.png
        cp www/res/screen/android/screen-xhdpi-portrait.png platforms/android/res/drawable-xhdpi/screen.png
        cp www/res/screen/android/screen-xhdpi-portrait.png platforms/android/res/drawable/screen.png

        message_info "Copying iOS app icons and splash screen images..."
        cp www/res/icon/ios/icon-57.png platforms/ios/Project/Resources/icons/icon.png
        cp www/res/icon/ios/icon-57-2x.png platforms/ios/Project/Resources/icons/icon@2x.png
        cp www/res/icon/ios/icon-72.png platforms/ios/Project/Resources/icons/icon-72.png
        cp www/res/icon/ios/icon-72-2x.png platforms/ios/Project/Resources/icons/icon-72@2x.png

        cp www/res/screen/ios/screen-iphone-portrait.png platforms/ios/Project/Resources/splash/Default~iphone.png
        cp www/res/screen/ios/screen-iphone-portrait-2x.png platforms/ios/Project/Resources/splash/Default@2x~iphone.png
        cp www/res/screen/ios/screen-iphone-portrait-568h-2x.png platforms/ios/Project/Resources/splash/Default-568h@2x~iphone.png
        cp www/res/screen/ios/screen-ipad-portrait.png platforms/ios/Project/Resources/splash/Default-Portrait~ipad.png
        cp www/res/screen/ios/screen-ipad-portrait-2x.png platforms/ios/Project/Resources/splash/Default-Portrait@2x~ipad.png
        cp www/res/screen/ios/screen-ipad-landscape.png platforms/ios/Project/Resources/splash/Default-Landscape~ipad.png
        cp www/res/screen/ios/screen-ipad-landscape-2x.png platforms/ios/Project/Resources/splash/Default-Landscape@2x~ipad.png
fi

# ----
# Add Plugins

if [[ $init = 1 ]] || [[ $plugins = 1 ]] ; then

        message_info "Adding Device Plugin..."
        cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-device.git

        message_info "Adding In-App Browser Plugin..."
        cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git

        message_info "Adding Splashscreen Plugin..."
        cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-splashscreen.git

        message_info "Adding Fullscreen Plugin..."
        cordova plugin add https://github.com/katzer/cordova-plugin-hidden-statusbar-overlay.git

        message_info "Adding iOS Export Compliance Plugin..."
        cordova plugin add https://github.com/andres-torres-marroquin/cordova-plugin-ios-no-export-compliance.git

        message_info "Adding Google Plus Plugin..."
        cordova plugin add cordova-plugin-googleplus
fi

# ----
# Prepare Platforms
if [[ $init = 1 ]] || [[ $update = 1 ]] ; then
        message_info "Syncing 'www' with Android platform..."
        cordova prepare android

        message_info "Syncing 'www' with iOS platform..."
        cordova prepare ios
fi
