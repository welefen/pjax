/*!
 * pjax for qwrap
 * 
 * by welefen
 */
(function(){
	var mix = Object.mix,
		isFunction = Object.isFunction;
	//check browser support pjax
	var supportPjax = !!(
		window.history && window.history.pushState && window.history.replaceState
		&& !(
			(/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent)
			|| (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent)
		)
	),
	supportStorage = !!window.localStorage, //是否支持localstorage
	pjaxStack = {}; //pjax数据缓存
	
	//获取当前的时间
	function getTime(){
		return new Date * 1;
	}
	//获取不带hash的url
	function getRealUrl(src){
		src = (src || '').replace(/\#.*?$/, '');
		return src;
	}
	//获取本地储存的key
	function getLocalKey(src){
		var s = 'pjax_' + encodeURIComponent(src);
		return {
			data: s + '_data',
			time: s + '_time',
			title: s + '_title'
		};
	}
	//清除所有的本地缓存
	function removeAllCache(){
		if(supportStorage){
			for(var name in localStorage){
				if((name.split('_') || [''])[0] === 'pjax'){
					delete localStorage[name];
				}
			}
		}
	}
	//获取缓存
	function getCache(src, time, flag){
		var item, vkey, tkey, tval;
		time = parseInt(time);
		if(src in pjaxStack){
			item = pjaxStack[src], ctime = getTime();
			if((item.time + time*1000) > ctime){
				return item;
			}else{
				delete pjaxStack[src];
			}
		}else if(flag && supportStorage){ //从localStorage里查询
			var l = getLocalKey(src);
			vkey = l.data;
			tkey = l.time;
			item = localStorage.getItem(vkey);
			if(item){
				tval = parseInt(localStorage.getItem(tkey));
				if((tval + time*1000) > getTime()){
					return {data: item, title: localStorage.getItem(l.title)};
				}else{
					localStorage.removeItem(vkey);
					localStorage.removeItem(tkey);
					localStorage.removeItem(l.title);
				}
			}
		}
		return null;
	}
	//设置缓存
	function setCache(src, data, title, flag){
		var time = getTime(), key;
		pjaxStack[src] = {data: data, title: title, time: time};
		if(flag && supportStorage){
			key = getLocalKey(src);
			localStorage.setItem(key.data, data);
			localStorage.setItem(key.time, time);
			localStorage.setItem(key.title, title);
		}
	}
	//清除缓存
	function removeCache(src){
		src = src || location.href;
		delete pjaxStack[getRealUrl(src)];
		if(supportStorage){
			var key = getLocalKey(src);
			localStorage.removeItem(key.data);
			localStorage.removeItem(key.time);
			localStorage.removeItem(key.title);
		}
	}
	var showFx = {
		"_default" : function(data, callback, isCache){
			this.html(data);
			callback && callback.call(this, data, isCache);
		}
	};
	var callback = function(fx, container, data, fn, isCache){
		var obj;
		if(typeof fx === 'function'){
			obj = fx;
		}else{
			if(!(fx in showFx)){
				fx = "_default";
			}
			obj = showFx[fx];
			if(Object.isObject(obj)){
				var init = obj.init;
				init && init.call(container, isCache);
				obj = obj.callback;
			};
		}
		obj && obj.call(container, data, function(){
			hash = location.hash;
			if (hash != '') {
				window.location.href = hash;
			}else{
				window.scrollTo(0, 0);
			}
			fn && fn.call(this, data, isCache);
		}, isCache);
	};
	function pjax(selector, options){
		options = mix({
			container: ''
		}, options, true);

		if(!options.container) return true;
		pjax.options = options;

		var container = W(options.container);

		W('body').delegate(selector, 'click', function(event){
			if ( event.which > 1 || event.metaKey ){
				return true;
			}

			if(isFunction(options.filter)){
				if(options.filter.call(this, this) === false) return true;
			}

			if(getRealUrl(this.href) == getRealUrl(location.href)){
				var hash = location.hash;
				if (hash != '') {
					location.href = hash;
					return true;
				}
			}

			event.preventDefault();

			pjax.request(mix({
				url: this.href,
				element: this
			}, options, true));
		})
	}
	
	
	pjax.request = function(options){
		var container = W(options.container), url, xhr, cache;
		options = mix({
			timeout:30000, 
			element: null,
			cache: 24*3600, //缓存时间, 0为不缓存, 单位为秒
			storage: true, 	//是否使用localstorage将数据保存到本地
			url: '', 		//链接地址
			push: true,    	//true is push, false is replace, null for do nothing
			show:'',       //展示的动画
			title: '', 		//标题
			titleSuffix: '', //标题后缀
			type: 'GET',
			dataType: 'html',
			callback: null, //回调函数 
			requestHeaders:{
				'X-PJAX': '1'
			},
			oncomplete : function() {
				pjax.ajax = null;
			},
			onerror: function(){
				location.href = options.url;
			},
			onsucceed: function(data, isCache){
				//isCache default is success
				if(isCache !== true){
					isCache = false;
				}
				if(typeof data ==='object'){
					data = this.requester.responseText;
				}
				if((data||'').indexOf('<html') != -1){
					location.href = options.url;
					return false;
				}
				var title = options.title, el, state;
				if(!title){
					var matches = data.match(/<title>(.*?)<\/title>/);
					if(matches){
						title = matches[1].decode4Html();
					}
				}
				if(title){
					if(title.indexOf(options.titleSuffix) == -1){
						title += ' ' + options.titleSuffix;
					}
					document.title = title;
				}
				state = {
					container: options.container,
					timeout: options.timeout,
					cache: options.cache,
					storage: options.storage,
					show: options.show,
					title: title,
					url: options.url
				};
				var query = Object.encodeURIJson(options.data);
			    if ( query != "" ){
			    	state.url = options.url + (/\?/.test(options.url) ? "&" : "?") + query;
			    }
				if(options.push){
					window.history.pushState(state, document.title, options.url);
				}else if(options.push === false){
					 window.history.replaceState(state, document.title, options.url);
				}
				if(options.push !== null){
					if(window._gaq){
						_gaq.push(['_trackPageview']);
					}
				}
				options.callback && options.callback(data, function(){
					container.fire('end.pjax');
				}, isCache);
				if(options.cache){
					setCache(getRealUrl(options.url), data, title, options.storage);
				}
			}
		}, options, true);
		if(W(options.element)){
			cache = parseInt(W(options.element).attr('data-pjax-cache')); //各个链接里可以加自己的缓存时间，主要是应对不同的类型进行不同的缓存
		}
		if(cache){
			options.cache = cache;
		}
		if(options.cache === true){
			options.cache = 24*3600;
		}
		if(!options.callback){
			options.callback = function(data, fn, isCache){
				callback(options.show, container, data, fn, isCache);
			};
		}
		//如果将缓存时间设为0，则将之前的缓存也清除
		if((parseInt(options.cache)) === 0){
			removeAllCache();
		}
		if(options.cache && (cache = getCache(getRealUrl(options.url), options.cache, options.storage))){
			container.fire('start.pjax');
			options.title = cache.title;
			options.onsucceed(cache.data, true);
			return true;
		}
		var ajax = pjax.ajax;
		if(ajax) {
			ajax.cancel();
		}

		ajax = new QW.Ajax(options);
		ajax.send(options.url, 'get', options.data);
		pjax.ajax = ajax;

		container.fire('start.pjax');
	};
	pjax.removeCache = removeCache;
	pjax.getRealUrl = getRealUrl;
	
	
	var popped = ('state' in window.history), initURL = location.href;
	W(window).on('popstate', function(event){
		var initPop = !popped && location.href == initURL, state, data, container;
		popped = true;
		if ( initPop ) return true;
		state = event.state;
		if( !state ) {
			var options = pjax.options;
			data = {
				url: initURL,
				container : options.container,
				push: null,
				timeout : options.timeout,
				cache: options.cache,
				storage: options.storage
			};
		} else {
			data = {
		        url: state.url || location.href,
		        container: state.container,
		        push: null,
		        timeout: state.timeout,
		        cache: state.cache,
		        storage: state.storage
			 };
		}
	    container = data.container;

	    if ( W(container).length ){
	    	 pjax.request(data);
	    }else{
	    	location.reload();
	    }
	});

	if(!supportPjax){
		pjax = function(selector, options){
			return false;
		};
	}
	QW.provide('pjax', pjax);
})();
