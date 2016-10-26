// 定义工具方法
var Util = {
	/**
	 * 通过id获取模板内容
	 * @id 		script模板标签id
	 **/ 
	tpl: function (id) {
		// 通过id获取模板内容
		return document.getElementById(id).innerHTML;
	},
	/**
	 * 异步请求方法
	 * @url 	请求地址
	 * @fn 		请求成功回调函数
	 */ 
	ajax: function (url, fn) {
		// 创建xhr对象
		var xhr = new XMLHttpRequest();
		// 订阅事件
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					// 将请求的数据传递给fn
					// 将返回的数据转化成json对象
					var data = JSON.parse(xhr.responseText)
					fn && fn(data)
				}
			}
		}
		// open方法
		xhr.open('GET', url, true)
		// send
		xhr.send(null);
	}
}

// 定义价格过滤器
Vue.filter('price', function (price) {
	return price + '元';
})
// 定义原价过滤器
Vue.filter('orignPrice', function (price) {
	return '门市价：' + price + '元';
})
// 定义销售过滤器
Vue.filter('sales', function (num) {
	return '已售' + num;
})

// 定义三个页面组件
// 首页组件
var HomComponent = Vue.extend({
	template: Util.tpl('tpl_home'),
	// 设置分类按钮的数据
	data: function () {
		return {
			types: [
				{id: 1, title: '美食', url: '01.png'},
				{id: 2, title: '电影', url: '02.png'},
				{id: 3, title: '酒店', url: '03.png'},
				{id: 4, title: '休闲娱乐', url: '04.png'},
				{id: 5, title: '外卖', url: '05.png'},
				{id: 6, title: 'KTV', url: '06.png'},
				{id: 7, title: '周边游', url: '07.png'},
				{id: 8, title: '丽人', url: '08.png'},
				{id: 9, title: '小吃快餐', url: '09.png'},
				{id: 10, title: '火车票', url: '10.png'}
			],
			ad: [],
			list: []
		}
	},
	// 组件渲染完毕的回调函数
	created: function () {
		this.$dispatch('show-search', true)
		var me = this;
		// 获取异步数据
		Util.ajax('data/home.json', function (res) {
			// console.log(res)
			// 将ad数据和list数据保存data中
			if (res && res.errno === 0) {
				// 存储数据
				// me.ad = res.data.ad;
				me.list = res.data.list;
				me.$set('ad', res.data.ad)
			}
		})
	}
})
// 定义列表页组件
var ListComponent = Vue.extend({
	template: Util.tpl('tpl_list'),
	// 获取父组件传递的search数据
	props: ['csearch'],
	// 定义同步数据
	data: function () {
		return {
			types: [
				{value: '价格排序', key: 'price'},
				{value: '销量排序', key: 'sales'},
				{value: '好评排序', key: 'evaluate'},
				{value: '优惠排序', key: 'discount'}
			],
			// 默认保留前三个
			list: [],
			// 保留剩下的
			other: []
		}
	},
	methods: {
		// 将其他几条产品显示出来
		loadMore: function () {
			// this可以访问到组件的实例化对象
			this.list = [].concat(this.list, this.other)
			// this.list = this.list.concat(this.other);
			this.other = [];
		},
		// 列表排序方法
		sortBy: function (type) {
			if (type === 'discount') {
				// 优惠排序，市场价 - 现价
				this.list.sort(function (a, b) {
					var ap = a.orignPrice - a.price;
					var bp = b.orignPrice - b.price;
					// 得到优惠排序，就是做ap与bp的差值
					return ap - bp;
				})
			} else {
				this.list.sort(function (a, b) {
					// 正序
					// return a[type] - b[type]
					// 倒序
					return b[type] - a[type]
				})
			}
			
		}
	},
	created: function () {
		this.$dispatch('show-search', true)
		var me = this;
		// 获取父组件中的query字段拼接url中query部分
		var query = me.$parent.query;
		// str 保留query字段 ?type=1
		var str = '?';
		if (query[0] && query[1]) {
			str += query[0] + '=' + query[1]
		}

		// 发送异步请求获取异步数据
		Util.ajax('data/list.json' + str, function (res) {
			// 保留返回数据
			if (res && res.errno === 0) {
				me.list = res.data.slice(0, 3)
				me.other = res.data.slice(3)
			}
		})
	}
})
// 定义商品页组件
var ProductComponent = Vue.extend({
	template: Util.tpl('tpl_product'),
	props: ['csearch'],
	data: function () {
		return {
			data: {
				src: '01.jpg'
			}
		}
	},
	created: function () {
		// 隐藏搜索框
		this.$dispatch('show-search', false)
		// 保存this
		var me = this;
		// 获取数据
		Util.ajax('data/product.json', function (res) {
			if (res && res.errno === 0) {
				me.data = res.data;
				console.log(me)
			}
		})
	}
})

// 注册组件
// 注册首页组件
Vue.component('home', HomComponent)
// 注册列表页组件
Vue.component('list', ListComponent)
// 注册商品页组件
Vue.component('product', ProductComponent)

// 创建Vue实例化对象
var app = new Vue({
	el: '#app',
	data: {
		view: '',
		// 保留hash中的动态query部分
		query: [],
		search: '',
		dealSearch: '',
		// 控制搜索框的显隐
		showSearch: true
	},
	methods: {
		goSearch: function () {
			// 将search 内容复制给dealSearch，将dealSearch传递给子组件
			this.dealSearch = this.search
		},
		goBack: function () {
			history.go(-1);
		}
	},
	events: {
		'show-search': function (val) {
			this.showSearch = val;
		}
	}
})


// 路由函数
function router () {
	// 处理hash业务逻辑
	// 获取hash，根据hash不同决定渲染哪个页面
	// 当hash是空时候，我们要设置默认值，'#home'
	var str = location.hash;
	// 处理到#
	str = str.slice(1);
	// 处理第一个/ 也就是 #/
	str = str.replace(/^\//, '')
	// 获取 / 前面的字符串
	// list/type/1 => ['list', 'type', '1']
	str = str.split('/')
	// if (str.indexOf('/') > -1) {
	// 	str = str.slice(0, str.indexOf('/'))
	// }
	// 映射列表
	var map = {
		home: true,
		list: true,
		product: true
	}
	// 判断str是否在map中，如果在，我们渲染页面，不在渲染home页面
	if (map[str[0]]) {
		// 想渲染哪个页面我们只需要将app.view设置成改字符串就可以
		app.view = str[0];
	} else {
		app.view = 'home'
	}
	// 将['type', '1']保留下来
	app.query = str.slice(1);
}

// 页面进入的时候，会触发load事件，我们要根据hash来决定进入那个页面
window.addEventListener('load', router)

// hash改变时候的事件交hashChange事件
window.addEventListener('hashchange', router)