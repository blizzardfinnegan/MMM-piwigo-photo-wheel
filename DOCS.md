# Complete overview

Since setting this up was a bit of a pain, here's my documentation of what needed to be done to properly run this project on a Pi3 with 1GB of RAM. This guide does, however, assume you have a running instance of [Piwigo](https://piwigo.org), at an address accessible for your Pi. If you are interested in a Docker deployment of this, LinuxServer provides and [image](https://github.com/linuxserver/docker-piwigo).

## Setting up the Pi

First thing's first, flash an image to an SD card, as this will be your boot device. The easiest way to do this to use the Raspberry Pi Imager. Either the `Raspberry Pi OS Full (64-bit)` or `Raspberry Pi OS (Legacy, 64-bit) Full` will do. While it should work with 32-bit installs, this has not been tested by myself personally, and MagicMirror explicitly will not work on any `Lite` variation of the OS (although for power users, installing a desktop environment should not be too much of a chore).

## First Boot of the Pi
Once the SD card has been successfully flashed (this will take some time), install the SD card into the Raspberry Pi. Connect the Pi to a display, then power it on[^1]. This will take longer than usual, as the Pi has to set up the SD card. Once booted, open the terminal and run
```
sudo apt install npm
```
This will install NodeJS, and its dependencies, which are required for this project. 

## Installing MagicMirror

Now that you have MagicMirror's dependencies installed, download MagicMirror itself, and install it:
```
git clone https://github.com/MichMich/MagicMirror && cd MagicMirror && npm run install-mm
```

Also install this module (since that's what you're here for, right?):
```
git clone https://github.com/blizzardfinnegan/MMM-piwigo-photo-wheel MagicMirror/modules/MMM-piwigo-photo-wheel
```

## Configuring MagicMirror

Now, copy the default config file so you can modify it:
```
cp MagicMirror/config/config.js.sample MagicMirror/config/config.js
```

Open the newly created `config.js` file, and modify the `modules: []` portion to include this module. If you are using this as a digital photo frame, all other modules can optionally be removed. Minimally, your modules configuration should look like this:
```
    modules: [
        {
            module:'MMM-piwigo-photo-wheel',
            position:'fullscreen_below', 
//position options are: top_bar , top_left , top_center , top_right , upper_third , middle_center , lower_third , bottom_left , bottom_center , bottom_right , bottom_bar , fullscreen_above , and fullscreen_below. For more info, see the MagicMirror documentation
            config:{
                piwigoBaseUrl: "http://[piwigo server location].ws.php",
                piwigoUsername: "username",
                piwigoPassword: "password",
            }
        },
    ]
```

It is not required, however it is highly recommended that you also include the dimensions of your screen in the modules page. This will make sure that the images downloaded and shown are as large as possible.
```
    modules: [
        {
            module:'MMM-piwigo-photo-wheel',
            position:'fullscreen_below', 
//position options are: top_bar , top_left , top_center , top_right , upper_third , middle_center , lower_third , bottom_left , bottom_center , bottom_right , bottom_bar , fullscreen_above , and fullscreen_below. For more info, see the MagicMirror documentation
            config:{
                piwigoBaseUrl: "http://[piwigo server location].ws.php",
                piwigoUsername: "username",
                piwigoPassword: "password",
                maxWidth: "720px",
                maxHeight: "480px"
            }
        },
    ]
```

See [the readme](README.md) for more information on configuration of this module.

## Configuring the Pi

Unfortunately, its not quite as simple as all that... Now, we have some configuration to do to get the Pi to play nicely.

First, create the directory `$HOME/.config/lxsession/LXDE-pi`, then open a file named `autostart` in that location.
```
mkdir -p $HOME/.config/lxsession/LXDE-pi/ && nano $HOME/.config/lxsession/LXDE-pi/autostart
```

In the file, put the following information: [A file containing this information has been provided for you in this repo, as well]
```
@xset s noblank
@xset s off
@xset -dpms
@xrandr --output HDMI-1 --mode 720x480 --rotate normal
```

The first three lines turn off the Pi's ScreenSaver. The last line forces the display to be 720x480, which is the standard size for most aftermarket Raspberry Pi displays. (This is also explicitly required if you do not get an image when the Pi first turns on, as described previously). For those wishing to change the rotation of the image on the screen, the `rotate` flag accepts arguments `normal`,`inverted`,`left`, and `right`.

Next, we'll install the process manager `pm2`. This allows us to run the MagicMirror GUI without requiring a user to manually start it every time. It also allows for more verbose logging, and a faster restart mechanism while testing changes to config files.
```
sudo npm install -g pm2
```

Create a script for `pm2` to run by running the following:
```
echo "cd $HOME/MagicMirror && DISPLAY=:0 npm start" > mm.sh
```

Give the script execute permissions, and register the script with pm2.
```
chmod +x mm.sh && pm2 start mm.sh && pm2 save && pm2 stop
```

Register `pm2` as a valid program to be run at startup by running the following:
```
pm2 startup
```
This will give you a response containing the command to be run.

Finally, to remove the mouse from screen (if you so choose), simply install the `unclutter` package:
```
sudo apt install unclutter
```

Now, reboot, and your digital image frame should be ready to go!
```
sudo reboot
```



[^1]: If you do not get an image on the device, and are using a screen such as [this](https://www.newegg.com/p/2NY-008V-00017?Item=9SIBJBBK6H4050), connect the Pi to a secondary screen for now. We'll resolve this farther along.
