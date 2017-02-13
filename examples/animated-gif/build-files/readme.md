# How I Generated this GIF

1. Record a quicktime move of the animation
2. Convert the quicktime movie to 57 still frames with this command:

    # Notes:
    # - I chose 57 frames because 57 * 0.02 (seconds/frame) = 1.14 seconds (and I needed 1.15s)
    # - I got the technique loosely from http://superuser.com/a/556031
    ffmpeg -i pink-bouncy-ball.mov -r 48 pink-frames/ffout%03d.png

3. Import the frames into photoshop as layers (see https://digitalchemy.wordpress.com/2010/10/08/photoshop-import-multiple-images-into-one-layered-document/)
4. Turn the layers into animation frames (see http://graphicdesign.stackexchange.com/a/48851/14744)
5. Change the delay on each frame to 0.02s
6. Export as animated Gif

(note: I tried this with 115 frames at 0.01 seconds per frame, but they turn out slow for some reason ¯\_(ツ)_/¯)
