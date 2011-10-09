## 介绍

pushState是一个可以操作history的api，该api的介绍和使用请见这里：http://www.welefen.com/use-ajax-and-pushstate.html

目前已经有http://github.com/, http://plus.google.com, http://www.welefen.com 等网站已经使用。

pjax是对ajax + pushState的封装，让你可以很方便的使用pushState技术。

同时支持了缓存和本地存储，下次访问的时候直接读取本地数据，无需在次访问。

并且展现方式支持动画技术，可以使用系统自带的动画方式，也可以自定义动画展现方式。

目前只提供了基于jquery的版本，后续将增加基于qwrap, tangram等版本。


## 如何使用

### jquery版
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
### qwrap版

```
	QW.pjax(selector, { //selector一般为a[href="^http://domain"]
		container: '#container',
		cache: true,
		storage: true
	})

```
## 事件(events)

一般情况下使用ajax来获取数据的时候，我们都希望有个loading的效果，pjax本身不提供这个功能，但提供了2个相关的事件。

如果需要这样的功能，可以在事件里实现这种功能。

* start.pjax 在pjax ajax发送request之前调用

* end.pjax 在phax ajax结束时调用

这样你可以在start.pjax事件里显示loading效果，在end.pjax事件里隐藏loading了。如：

```
	$('#container').bind('start.pjax', function(){
		$('#loading').show();
	})
	$('#container').bind('end.pjax', function(){
		$('#loading').hide();
	})
```

## 浏览器支持

提供了history.pushState接口的浏览器才支持这个功能，$.support.pjax是用来判断浏览器是否支持的。

如果浏览器不支持这个功能而调用pjax方法的话，实际上什么都没做，还是使用默认的链接响应机制

## 后端需要做的

类似于ajax, 异步请求的时候后端不能将公用的内容也返回。

所以需要一个判断是否pjax请求的接口。如：php可以借鉴下面的实现

```
	function gplus_is_pjax(){
		return array_key_exists('HTTP_X_PJAX', $_SERVER) && $_SERVER['HTTP_X_PJAX'] === 'true';
	}	
```

## 其他

实际上该类的封装借鉴于https://github.com/defunkt/jquery-pjax

对其增加了缓存、本地存储和动画等功能，并且将一些参数进行了优化。

