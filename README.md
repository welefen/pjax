## 介绍

pushState是一个可以操作history的api，该api的介绍和使用请见这里：http://www.welefen.com/use-ajax-and-pushstate.html

目前已经有http://github.com/, http://plus.google.com, http://www.welefen.com 等网站已经使用。

pjax是对ajax + pushState的封装，让你可以很方便的使用pushState技术。

同时支持了缓存和本地存储，下次访问的时候直接读取本地数据，无需在次访问。

并且展现方式支持动画技术，可以使用系统自带的动画方式，也可以自定义动画展现方式。


## 如何使用

将jquery.pjax.js部署到你的页面中，将需要使用pjax的a链接进行绑定（不能绑定外域的url），如:


```
	$('a').pjax({
		container: '#container', //内容替换的容器
		fx: 'fade',  //展现的动画，支持默认和fade, 可以自定义动画方式，这里为自定义的function即可。
		cache: true,  //是否使用缓存
		storage: true,  //是否使用本地存储
		titleSuffix: '' //标题后缀
	})

```



