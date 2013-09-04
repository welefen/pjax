/*!
 * pjax(ajax + history.pushState) for qwrap
 * 
 * by welefen
 */
(function() {
	var mix = function(){
		var target = arguments[0] ,i = 1, len = arguments.length;
		for(;i<len;i++){
			target = Object.mix(target, arguments[i], true);
		}
		return target;
	}
	
	var Util = {
		support : {
			pjax : window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/(iPod|iPhone|iPad|WebApps\/.+CFNetwork)/),
			storage : !!window.localStorage
		},
		toInt : function(obj) {
			return parseInt(obj);
		},
		stack : {},
		getTime : function() {
			return new Date * 1;
		},
		// 获取URL不带hash的部分,切去掉pjax=true部分
		getRealUrl : function(url) {
			url = (url || '').replace(/\#.*?$/, '');
			url = url.replace('?pjax=true&', '?').replace('?pjax=true', '').replace('&pjax=true', '');
			return url;
		},
		// 获取url的hash部分
		getUrlHash : function(url) {
			return url.replace(/^[^\#]*(?:\#(.*?))?$/, '$1');
		},
		// 获取本地存储的key
		getLocalKey : function(src) {
			var s = 'pjax_' + encodeURIComponent(src);
			return {
				data : s + '_data',
				time : s + '_time',
				title : s + '_title'
			};
		},
		// 清除所有的cache
		removeAllCache : function() {
			if (!Util.support.storage)
				return;
			for ( var name in localStorage) {
				if ((name.split('_') || [ '' ])[0] === 'pjax') {
					delete localStorage[name];
				}
			}
		},
		// 获取cache
		getCache : function(src, time, flag) {
			var item, vkey, tkey, tval;
			time = Util.toInt(time);
			if (src in Util.stack) {
				item = Util.stack[src], ctime = Util.getTime();
				if ((item.time + time * 1000) > ctime) {
					return item;
				} else {
					delete Util.stack[src];
				}
			} else if (flag && Util.support.storage) { // 从localStorage里查询
				var l = Util.getLocalKey(src);
				vkey = l.data;
				tkey = l.time;
				item = localStorage.getItem(vkey);
				if (item) {
					tval = Util.toInt(localStorage.getItem(tkey));
					if ((tval + time * 1000) > Util.getTime()) {
						return {
							data : item,
							title : localStorage.getItem(l.title)
						};
					} else {
						localStorage.removeItem(vkey);
						localStorage.removeItem(tkey);
						localStorage.removeItem(l.title);
					}
				}
			}
			return null;
		},
		// 设置cache
		setCache : function(src, data, title, flag) {
			var time = Util.getTime(), key;
			Util.stack[src] = {
				data : data,
				title : title,
				time : time
			};
			if (flag && Util.support.storage) {
				key = Util.getLocalKey(src);
				localStorage.setItem(key.data, data);
				localStorage.setItem(key.time, time);
				localStorage.setItem(key.title, title);
			}
		},
		// 清除cache
		removeCache : function(src) {
			src = Util.getRealUrl(src || location.href);
			delete Util.stack[src];
			if (Util.support.storage) {
				var key = Util.getLocalKey(src);
				localStorage.removeItem(key.data);
				localStorage.removeItem(key.time);
				localStorage.removeItem(key.title);
			}
		}
	};
	// pjax
	var pjax = function(options) {
		options = mix({}, {
			selector : '',
			container : '',
			callback : function() {},
			fitler : function() {}
		}, options);
		if (!options.container || !options.selector) {
			throw new Error('selector & container options must be set');
		}
		W('body').delegate(options.selector, 'click', function(event) {
			if (event.which > 1 || event.metaKey) {
				return true;
			}
			var $this = W(this), href = $this.attr('href');
			// 过滤
			if (typeof options.filter === 'function') {
				if (options.filter.call(this, href, this) === true){
					return true;
				}
			}
			if (href === location.href) {
				return true;
			}
			// 只是hash不同
			if (Util.getRealUrl(href) == Util.getRealUrl(location.href)) {
				var hash = Util.getUrlHash(href);
				if (hash) {
					location.hash = hash;
					options.callback && options.callback.call(this, {
						type : 'hash'
					});
				}
				return true;
			}
			event.preventDefault();
			options = mix({}, options, {
				url : href,
				element : this
			});
			// 发起请求
			pjax.request(options);
		});
	};
	pjax.xhr = null;
	pjax.options = {};
	pjax.state = {};
	
	// 默认选项
	pjax.defaultOptions = {
		timeout : 2000,
		element : null,
		cache : 24 * 3600, // 缓存时间, 0为不缓存, 单位为秒
		storage : true, // 是否使用localstorage将数据保存到本地
		url : '', // 链接地址
		push : true, // true is push, false is replace, null for do nothing
		show : '', // 展示的动画
		title : '', // 标题
		titleSuffix : '',// 标题后缀
		type : 'GET',
		data : {
			pjax : true
		},
		dataType : 'html',
		callback : null, // 回调函数
		requestHeaders:{
			'X-PJAX': true
		},
		onerror : function() {
			pjax.options.callback && pjax.options.callback.call(pjax.options.element, {
				type : 'error'
			});
			location.href = pjax.options.url;
		},
		oncomplete : function(xhr) {
			W(pjax.options.container).fire('pjax.end', [ xhr, pjax.options ]);
		}
	};
	// 展现动画
	pjax.showFx = {
		"_default" : function(data, callback, isCached) {
			this.html(data);
			callback && callback.call(this, data, isCached);
		}
	}
	// 展现函数
	pjax.showFn = function(showType, container, data, fn, isCached) {
		var fx = null;
		if (typeof showType === 'function') {
			fx = showType;
		} else {
			if (!(showType in pjax.showFx)) {
				showType = "_default";
			}
			fx = pjax.showFx[showType];
		}
		fx && fx.call(container, data, function() {
			var hash = location.hash;
			if (hash != '') {
				location.href = hash;
				//for FF
				if(/Firefox/.test(navigator.userAget)){
					history.replaceState($.extend({}, pjax.state, {
						url : null
					}), document.title);
				}
			} else {
				window.scrollTo(0, 0);
			}
			fn && fn.call(this, data, isCached);
		}, isCached);
	}
	// success callback
	pjax.onsucceed = function(data, isCached) {
		// isCached default is success
		if (isCached !== true) {
			isCached = false;
		}
		if(typeof data ==='object'){
			data = this.requester.responseText;
		}
		if ((data || '').indexOf('<html') != -1) {
			pjax.options.callback && pjax.options.callback.call(pjax.options.element, {
				type : 'error'
			});
			location.href = pjax.options.url;
			return false;
		}
		var title = pjax.options.title, el;
		if (!title) {
			var matches = data.match(/<title>(.*?)<\/title>/);
			if (matches) {
				title = matches[1].decode4Html();
			}
			if (!title && pjax.options.element) {
				el = W(pjax.options.element);
				title = el.attr('title') || el.html();
			}
		}
		if (title) {
			if (title.indexOf(pjax.options.titleSuffix) == -1) {
				title += pjax.options.titleSuffix;
			}
			document.title = title;
		}
		pjax.state = {
			container : pjax.options.container,
			timeout : pjax.options.timeout,
			cache : pjax.options.cache,
			storage : pjax.options.storage,
			show : pjax.options.show,
			title : title,
			url : pjax.options.oldUrl
		};
		var query = Object.encodeURIJson(pjax.options.data);
		if (query != "") {
			pjax.state.url = pjax.options.url + (/\?/.test(pjax.options.url) ? "&" : "?") + query;
		}
		if (pjax.options.push) {
			if (!pjax.active) {
				history.replaceState(mix({}, pjax.state, {
					url : null
				}), document.title);
				pjax.active = true;
			}
			history.pushState(pjax.state, document.title, pjax.options.oldUrl);
		} else if (pjax.options.push === false) {
			history.replaceState(pjax.state, document.title, pjax.options.oldUrl);
		}
		pjax.options.showFn && pjax.options.showFn(data, function() {
			pjax.options.callback && pjax.options.callback.call(pjax.options.element,{
				type : isCached? 'cache' : 'success'
			});
		}, isCached);
		// 设置cache
		if (pjax.options.cache && ! isCached) {
			Util.setCache(pjax.options.url, data, title, pjax.options.storage);
		}
	};
	
	// 发送请求
	pjax.request = function(options) {
		options = mix({}, pjax.defaultOptions, options);
		var cache, container = W(options.container);
		options.oldUrl = options.url;
		options.url = Util.getRealUrl(options.url);
		if(W(options.element)){
			cache = Util.toInt(W(options.element).attr('data-pjax-cache'));
			if (cache) {
				options.cache = cache;
			}
		}
		if (options.cache === true) {
			options.cache = 24 * 3600;
		}
		options.cache = Util.toInt(options.cache);
		// 如果将缓存时间设为0，则将之前的缓存也清除
		if (options.cache === 0) {
			Util.removeAllCache();
		}
		// 展现函数
		if (!options.showFn) {
			options.showFn = function(data, fn, isCached) {
				pjax.showFn(options.show, container, data, fn, isCached);
			};
		}
		pjax.options = options;
		pjax.options.onsucceed = pjax.onsucceed;
		if (options.cache && (cache = Util.getCache(options.url, options.cache, options.storage))) {
			container.fire('pjax.start');
			options.title = cache.title;
			pjax.onsucceed(cache.data, true);
			options.oncomplete();
			return true;
		}
		if (pjax.xhr && pjax.xhr.cancel) {
			pjax.xhr.cancel();
		}
		pjax.xhr = new QW.Ajax(pjax.options);
		container.fire('pjax.start');
		pjax.xhr.send(pjax.options.url, 'get', pjax.options.data);
	};

	// popstate event
	var popped = ('state' in window.history), initialURL = location.href;
	W(window).on('popstate', function(event) {
		var initialPop = !popped && location.href == initialURL;
		popped = true;
		if (initialPop) return;
		var state = event.state;
		if (state && state.container) {
			if (W(state.container).length) {
				var data = {
					url : state.url || location.href,
					container : state.container,
					push : null,
					timeout : state.timeout,
					cache : state.cache,
					storage : state.storage
				};
				pjax.request(data);
			} else {
				window.location = location.href;
			}
		}
	});

	// not support
	if (!Util.support.pjax) {
		pjax = function() {
			return true;
		};
		pjax.request = function(options) {
			if (options && options.url) {
				location.href = options.url;
			}
		};
	}
	pjax.util = Util;
	QW.provide('pjax', pjax);

})();
