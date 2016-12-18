import React, {
	Component
} from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	Image,
	ScrollView,
	Animated,
	TouchableOpacity,
	Dimensions,
	NavigatorIOS,
	Modal,
	Button,
	Alert
} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = windowWidth * 1714 / 750;
const SCROLL1TOP = -(Math.floor(windowHeight * 0.3104));
const SCROLL2TOP = -(Math.floor(windowHeight * 0.2174));
const SCROLL3TOP = -(Math.floor(windowHeight * 0.1243));
const SCROLLITEM = Math.floor(windowWidth * 0.2156); //每一个奖章的高度，最后用来计算最终的高度
const WORDPOSITION = Math.floor(windowWidth * 0.83125); //文字层位置
const SCROLL1REF = 'SCROLL1REF';
const SCROLL2REF = 'SCROLL2REF';
const SCROLL3REF = 'SCROLL3REF';
const CONTAINER = 'CONTAINER';
const WORDCONTAINER = 'WORDCONTAINER';

export default class AwesomeProject extends Component {
	constructor(props) {
		super(props);
		this._startShake = this._startShake.bind(this); //绑定
		this._rotateAnimated = this._rotateAnimated.bind(this); //绑定
		this._rebackShake = this._rebackShake.bind(this); //绑定
		this._startScroll = this._startScroll.bind(this); //绑定
		this._refSet = this._refSet.bind(this); //绑定
		this._startScrollActurally = this._startScrollActurally.bind(this); //绑定
		this._startWordAnimate = this._startWordAnimate.bind(this); //绑定
		this._getPrize = this._getPrize.bind(this); //绑定
		this._desc = this._desc.bind(this); //绑定
		this._rotate = 0; //遥感旋转角度
		this._time = null; //计算时间
		this._prizenum = 3; //竖列次数flag 用来约束点击摇奖
		this._prizearr = []; //记录最终摇奖序列
		this.state = { //遥杆动画状态
			transformYValue: new Animated.Value(0),
			rotateXValue: 0,
		};
	}
	componentDidMount() {
		//组件加载完后就让文字动
		this._startWordAnimate(0.05);
	}
	_rebackShake() {
		//回去
		const nowtime = Date.now();
		let detatime = nowtime - this._time;
		this._time = nowtime;
		this._rotate -= detatime * 0.09;
		if (this.state.rotateXValue < 0) {
			return;
		} else {
			this.setState({
				rotateXValue: this._rotate
			});
			requestAnimationFrame(this._rebackShake);
		}
	}
	_rebackTrans() {
		//摇完奖后返回
		Animated.timing(this.state.transformYValue, {
			toValue: 0,
			duration: 500,
		}).start();
	}
	_rotateAnimated() {
		//按照x轴旋转效果
		let nowtime = Date.now();
		let detatime = nowtime - this._time;
		this._time = nowtime;
		this._rotate += detatime * 0.09;
		if (this._rotate > 45) {
			this._rebackShake();
			this._rebackTrans();
			return;
		} else {
			this.setState({
				rotateXValue: this._rotate
			});
			requestAnimationFrame(this._rotateAnimated);
		}
	}
	_setLeft(refer, value) {
		this.refs[refer].setNativeProps({
			style: {
				transform: [{
					translateX: value
				}]
			}
		})
	}
	_startWordAnimate(speed) {
		let wordTime = Date.now();
		let leftObject = 0;
		let wordRefer = WORDCONTAINER;
		const self = this;
		const wordAnimated = function() {
			let nowtime = Date.now();
            let detatime = nowtime - wordTime;
			wordTime = nowtime;
			leftObject -= detatime * speed;
			if (Math.abs(leftObject) > 500) {
				leftObject = WORDPOSITION;
				requestAnimationFrame(wordAnimated);
			} else {
				self._setLeft(wordRefer, leftObject);
				requestAnimationFrame(wordAnimated);
			}
		}
		wordAnimated();
	}
	_startShake() {
		//摇奖点击
		if (this._prizenum === 3) {
			this._prizenum = 0;
			Animated.timing(this.state.transformYValue, {
				toValue: 20,
				duration: 500,
			}).start();

			this._time = Date.now();
			this._rotateAnimated();
			this._startScroll();
		}
	}
	_refSet(refer, props) {
		//设置文字的位置
		this.refs[refer].setNativeProps({
			style: {
				transform: [{
					translateY: props
				}]
			}
		})
	}
	_desc() {
		//点击说明滑动到下面文字
		this.refs.CONTAINER.scrollTo({
			x: 0,
			y: 160,
			animated: true
		})
	}
	_getPrize() { //获奖
		console.log('中奖序列', this._prizearr);
	}
	_startScrollActurally(id, speed, cyclecount) { //抽奖具体执行
		let scrollTime = Date.now();
		let scrollObject = null;
		let scrollRefer = null;
		let count = 0;
		if (id === 1) {
			scrollObject = SCROLL1TOP;
			scrollRefer = SCROLL1REF;
		}
		if (id === 2) {
			scrollObject = SCROLL2TOP;
			scrollRefer = SCROLL2REF;
		}
		if (id === 3) {
			scrollObject = SCROLL3TOP;
			scrollRefer = SCROLL3REF;
		}
		let scrollOriginalTop = scrollObject;
		const self = this;
		const scroll = function() {
			let nowtime = Date.now();
            let detatime = nowtime - scrollTime;
			scrollTime = nowtime;
			scrollObject += detatime * speed;

			if (count > cyclecount) {
				let prizeindex = Math.floor(Math.random() * 6); //随机抽
				let prizelevel = prizeindex % 3; //跟三取余找下标
				self._prizearr.push(prizelevel + 1);
				let tal = -prizelevel * SCROLLITEM - 22;
				scrollObject = tal;
				self._refSet(scrollRefer, scrollObject);
				self._prizenum++;
				if (self._prizenum === 3) {
					setTimeout(self._getPrize, 1000);
				}
				return;
			} else {
				if (scrollObject >= 0) { //重复
					scrollObject = scrollOriginalTop;
					count++;
					self._refSet(scrollRefer, scrollObject);
				} else {
					self._refSet(scrollRefer, scrollObject);
				}
				requestAnimationFrame(scroll);
			}
		}
		scroll();
	}
	_startScroll() {
		//开启摇奖三列按顺序执行大循环随机
		this._prizearr = []; //清掉抽奖组
		let cyclecount = Math.floor(Math.random() * 5) + 20;
		this._startScrollActurally(1, 4, cyclecount);
		cyclecount = Math.floor(Math.random() * 5) + 20;
		setTimeout(this._startScrollActurally, 1000, 2, 2, cyclecount);
		cyclecount = Math.floor(Math.random() * 5) + 20;
		setTimeout(this._startScrollActurally, 2000, 3, 1, cyclecount);
	}
	render() {
		return (
			<ScrollView style={styles.container} ref={CONTAINER}>
		        <TouchableOpacity
                    style={styles.buttons}
                    onPress={() => Alert.alert('Button has been pressed!')}
                >
					<Text style={styles.buttonContent}>确定</Text>
				</TouchableOpacity>
        		<Image source={require('./assets/prize_bg.jpg')} style={styles.scene}>
					<View style={styles.prizeScrollContainer}>
						<View style={{flexDirection:'row',justifyContent:'space-between',position:'absolute',left:0,height:40,alignItems:'center',marginRight: 20,backgroundColor:'transparent',transform:[{translateX:WORDPOSITION}]}} ref={WORDCONTAINER}>
							<Text style={styles.word}>这是一段文字1</Text>
							<Text style={styles.word}>这是一段文字2</Text>
							<Text style={styles.word}>这是一段文字3</Text>
							<Text style={styles.word}>这是一段文字4</Text>
							<Text style={styles.word}>这是一段文字5</Text>
						</View>
					</View>
					<TouchableOpacity onPress={this._desc}  activeOpacity={1} >
						<View style={styles.desc}></View>
					</TouchableOpacity>
					<View style={styles.prizeBingo}>
						<View style={styles.prizeBingoContainer}>
							<Animated.View style={{
								transform:[{translateY:SCROLL1TOP}],
								position: 'absolute',
								flexDirection: 'column',
								justifyContent: 'space-between',
								width: 69, }}
								ref = {SCROLL1REF}
							>
								<Image source={require('./assets/scroll_item_1.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_2.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_3.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_1.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_2.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_3.png')} style={styles.prizeLevel} />
							</Animated.View>
						</View>
						<View style={styles.prizeBingoContainer}>
							<Animated.View style={{
								transform:[{translateY:SCROLL2TOP}],
								position: 'absolute',
								flexDirection: 'column',
								justifyContent: 'space-between',
								width: 69, }}
								ref={SCROLL2REF}
							>
								<Image source={require('./assets/scroll_item_1.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_2.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_3.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_1.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_2.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_3.png')} style={styles.prizeLevel} />
							</Animated.View>
						</View>
						<View style={styles.prizeBingoContainer}>
							<Animated.View style={{
								transform:[{translateY:SCROLL3TOP}],
								position: 'absolute',
								flexDirection: 'column',
								justifyContent: 'space-between',
								width: 69, }}
								ref={SCROLL3REF}
							>
								<Image source={require('./assets/scroll_item_1.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_2.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_3.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_1.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_2.png')} style={styles.prizeLevel} />
								<Image source={require('./assets/scroll_item_3.png')} style={styles.prizeLevel} />
							</Animated.View>
						</View>
					</View>
					<TouchableOpacity onPress={this._startShake}  activeOpacity={1} >
						<Animated.Image source={require('./assets/btn_start.png')} style={[styles.starbtn,{transform:[{translateY:this.state.transformYValue},{rotateX:this.state.rotateXValue +'deg'}]}]} />
					</TouchableOpacity>
				</Image>
      		</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#F5FCFF',
	},
	buttons: {
		height: 40,
		width: 200,
		borderRadius: 20,
		backgroundColor: 'green',
		justifyContent: 'center',
	},
    buttonContent: {
        textAlign: 'center',
        color: 'white',
    },
	btns: {
		flex: 1,
		width: 30,
	},
	scene: {
		width: windowWidth,
		height: windowHeight,
	},
	starbtn: {
		position: 'absolute',
		width: windowWidth * 0.09375,
		height: windowHeight * 0.1080,
		left: windowWidth * 0.8125,
		top: windowHeight * 0.4035,
	},
	prizeBingo: {
		position: 'absolute',
		flexDirection: 'row',
		justifyContent: 'center',
		width: windowWidth * 0.6531,
		height: windowHeight * 0.2366,
		left: windowWidth * 0.1093,
		top: windowHeight * 0.3392,
		overflow: 'hidden',
	},
	prizeBingoContainer: {
		width: windowWidth * 0.215625,
		height: windowHeight * 0.23666,
	},
	prizeLevel: {
		width: windowWidth * 0.215625,
		height: windowWidth * 0.215625,
	},
	desc: {
		position: 'absolute',
		width: windowWidth * 0.171875,
		height: windowHeight * 0.125,
		left: windowWidth * 0.78125,
		top: windowHeight * 0.2393,
		opacity: 0,
	},
	prizeScrollContainer: {
		position: 'absolute',
		width: windowWidth * 0.7375,
		height: windowHeight * 0.054,
		left: windowWidth * 0.0375,
		top: windowHeight * 0.23529,
		overflow: 'hidden',
	},
	word: {
		marginRight: 20,
		fontSize: 20,
		color: '#88F1F6',
		backgroundColor: 'transparent'
	}
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
