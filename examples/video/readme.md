# HTML5 Video

Animated video can be embedded using the HTML5 `<video>` tag. The tag supports a number of [features](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#Attributes) for customizing the video experience, including autoplay, looping, and optional video controls.

The video tag allows you define multiple sources, one for each video format you provide. Browsers will request a source based on the formats they support. Common formats for web video include [H.264 (MP4)](https://en.wikipedia.org/wiki/H.264/MPEG-4_AVC), [WebM](https://en.wikipedia.org/wiki/WebM) and [Theora (Ogg)](https://en.wikipedia.org/wiki/Theora). H.264 (MP4) [currently has the widest browser support](https://en.wikipedia.org/wiki/HTML5_video#Browser_support).

Some browsers and devices make assumptions about video content and control the behavior in various ways. For example, [some iOS devices will prevent autoplay and add native controls](https://webkit.org/blog/6784/new-video-policies-for-ios/), even when you don't include those attributes. For this reason, it's recommended to only use video animation for "video-like" content.


## Resources

* [The HTML5 `<video>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
* [HTML5 video format browser support matrix](https://en.wikipedia.org/wiki/HTML5_video#Browser_support)
