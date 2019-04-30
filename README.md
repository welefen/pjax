
[WARNING] 该项目已经停止维护，愿意继续维护的同学请联系 welefen@gmail.com，可以把项目转给你。

## 介绍

pushState是一个可以操作history的api，该api的介绍和使用请见这里：http://www.welefen.com/use-ajax-and-pushstate.html

目前已经有http://github.com/, http://plus.google.com, http://www.welefen.com 等网站已经使用。

pjax是对ajax + pushState的封装，让你可以很方便的使用pushState技术。

同时支持了缓存和本地存储，下次访问的时候直接读取本地数据，无需在次访问。

并且展现方式支持动画技术，可以使用系统自带的动画方式，也可以自定义动画展现方式。



## 如何使用

### jquery版
将jquery.pjax.js部署到你的页面中，将需要使用pjax的a链接进行绑定（不能绑定外域的url），如:


```js
$.pjax({
  selector: 'a',
  container: '#container', //内容替换的容器
  show: 'fade',  //展现的动画，支持默认和fade, 可以自定义动画方式，这里为自定义的function即可。
  cache: true,  //是否使用缓存
  storage: true,  //是否使用本地存储
  titleSuffix: '', //标题后缀
  filter: function(){},
  callback: function(){}
})
```
**注意：若设置 storage 为 true，为避免多次请求页面后导致本地 localStorage 容量不足而触发异常，请在页面加载完成后加载以下 JavaScript 代码清除已过期的记录。**

```javascript
if (!!window.localStorage) {
    for (var key in localStorage) {
        try {
            if ((key.split("_") || [""])[0] === "pjax") {
                var item = localStorage.getItem(key);
                if (item) {
                    item = JSON.parse(item);
                    if ((parseInt(item.time) + 600 * 1000) <= new Date * 1) {
                        localStorage.removeItem(key)
                    }
                }
            }
        } catch (e) { }
    }
}
```



### qwrap版

qwrap版需要在页面引入qwrap和对应的ajax组件。

qwrap见： https://github.com/jkisjk/qwrap

对应的ajax组件见： https://github.com/jkisjk/qwrap/tree/master/resource/js/wagang/ajax

或者你直接引用我打包好的： http://www.welefen.com/wp-content/themes/gplus/js/qwrap.js 由于我的空间速度不咋地，建议你另存为。


```js
QW.pjax(
  selector: 'a',
  container: '#container',
  cache: true,
  storage: true,
  titleSuffix: '',
  filter: function(){},
  callback: function(){}
})
```
### kissy版

kissy版需要在页面引入kissy。

kissy见： http://docs.kissyui.com/

```js
KISSY.pjax(
  selector: 'a',
  container: '#container',
  cache: true,
  storage: true,
  titleSuffix: '',
  filter: function(){},
  callback: function(){}
})
```

由于kissy核心没有引用sizzle, 只支持一些简单的selector, 所以selector参数的值最好只为a， 对于一些不使用pjax的链接，可以通过filter函数参数进行过滤，具体的使用方法见下面的参数说明。


## 参数及含义

=== options.selector

给哪些selector绑定pjax事件，一般的为："a", 如果要去掉一些外连的URL， 这里的selector可以为: "a[href^='http://www.welefen.com']"

，表示域名是www.welefen.com下才有pjax事件（也就是站内）。

=== options.container

内容变换容器，是指哪个容器里的内容发生的变换，如： '#content',

=== options.cache

缓存pjax的内容，对于更新不频繁的页面来说，缓存pjax内容可以减少HTTP请求数

options.cache的值是缓存时间，单位为秒，默认为: 24*3600(一天)

=== options.storage

是否使用本地存储进行内容的缓存，使用本地存储缓存的话即使关闭浏览器后，下次访问如果缓存时间有效的话会直接读取缓存的内容，避免重新请求了。

=== options.titleSuffix

标题后缀。

对于pjax显示标题，首先会从返回内容里查找，如果没有的话，会取当前a标签的title值，并可以指定统一的后缀

=== options.filter

过滤函数，虽然options.selector可以写个比较复杂的选择器，但有时候还要过滤一些URL，如：后台的URL。

这时候就可以使用options.filter函数进行过滤了。如：

```js
{
  filter: function(href){
    //对于wordpress后台的URL和wp-content里的URL不使用pjax
    if(href.indexOf('/wp-admin') || href.indexOf('/wp-content')){
      return true;
    }
  }
}
```
对于要过滤掉的URL， 需要返回值为true。

=== options.callback

回调函数，这个函数不同于pjax.start和pjax.end（这2个事件下面描述）事件。

该函数会在每个阶段都会执行，即使pjax发生error的时候，并且会传递一个参数标明当前的状态，如：

```js
{
  callback: function(status){
    var type = status.type;
    switch(type){
      case 'success': ;break; //正常
      case 'cache':;break; //读取缓存	
      case 'error': ;break; //发生异常
      case 'hash': ;break; //只是hash变化
    }
  }
}
```

## 事件(events)

一般情况下使用ajax来获取数据的时候，我们都希望有个loading的效果，pjax本身不提供这个功能，但提供了2个相关的事件。

如果需要这样的功能，可以在事件里实现这种功能。

* pjax.start 在pjax ajax发送request之前调用

* pjax.end 在phax ajax结束时调用

这样你可以在pjax.start事件里显示loading效果，在pjax.end事件里隐藏loading了。如：

```js
$('#container').bind('pjax.start', function(){
  $('#loading').show();
})
$('#container').bind('pjax.end', function(){
  $('#loading').hide();
})
```

## 浏览器支持

提供了history.pushState接口的浏览器才支持这个功能

如果浏览器不支持这个功能而调用pjax方法的话，实际上什么都没做，还是使用默认的链接响应机制

## 后端需要做的

类似于ajax, 异步请求的时候后端不能将公用的内容也返回。

所以需要一个判断是否pjax请求的接口。如：php可以借鉴下面的实现

```
function is_pjax(){
  return array_key_exists('HTTP_X_PJAX', $_SERVER) && $_SERVER['HTTP_X_PJAX'];
}	
```

## 其他

实际上该类的封装借鉴于<https://github.com/defunkt/jquery-pjax>

对其增加了缓存、本地存储和动画等功能，并且将一些参数进行了优化。

