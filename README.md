## 介绍
pjax是使用ajax + pushstate 达到无刷新改变页面内容并可以改变URL的技术，

该技术可以对原生的a链接的体验进行增强，不支持该技术的浏览器还是用链接的方式打开页面。支持的浏览器则使用pjax技术。

jquery.pjax.js 是对ajax + pushstate 进行封装，这样就可以很方便的使用该技术在你的网站中。

demo地址： <http://www.welefen.com>， 点击页面中的链接就可以看到效果了。

## 已经使用该技术的网站

www.github.com

http://plus.google.com

www.welefen.com 以及使用了plus主题的wordpress博客等

## 如何使用

将jquery.pjax.js部署到你的页面中，将需要使用pjax的a链接进行绑定（不能绑定外域的url），如:


```


```



