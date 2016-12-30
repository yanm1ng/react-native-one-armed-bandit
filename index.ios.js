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
	Navigator,
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

		this._startShake = this._startShake.bind(this);
		this._setChoose = this._setChoose.bind(this);
		this._checkChoose = this._checkChoose.bind(this);
		this._setGameModel = this._setGameModel.bind(this);
		this._setNum = this._setNum.bind(this);
		this._showAccount = this._showAccount.bind(this);
		this._renderGameImage = this._renderGameImage.bind(this);
		this._renderAImage = this._renderAImage.bind(this);
		this._renderBImage = this._renderBImage.bind(this);
		this._renderCImage = this._renderCImage.bind(this);
		this._rotateAnimated = this._rotateAnimated.bind(this);
		this._rebackShake = this._rebackShake.bind(this);
		this._startScroll = this._startScroll.bind(this);
		this._refSet = this._refSet.bind(this); //绑定
		this._startScrollActurally = this._startScrollActurally.bind(this);
		this._startWordAnimate = this._startWordAnimate.bind(this);
		this._getPrize = this._getPrize.bind(this);

		this._model = true;
		this._account = 2000; //初始金额
		this._num = 0;
		this._choose = false;
		this._rotate = 0; //遥感旋转角度
		this._time = null; //计算时间
		this._prizetext = ''; //中奖显示的信息
		this._prizenum = 3; //竖列次数flag 用来约束点击摇奖
		this._prizearr = []; //记录最终摇奖序列
		this.state = {
			//遥杆动画状态
			transformYValue: new Animated.Value(0),
			rotateXValue: 0,
		};
	}
	componentDidMount() {
		//组件加载完后就让文字动
		this._startWordAnimate(0.05);
	}
	_setNum(num) {
		if(this._choose) {
      Alert.alert('温馨提示', '你已经下注了请点击摇杆进行游戏');
		}
		else {
      this._num = num;
      this.setState({
        _num: num
      });
		}
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
		};
		wordAnimated();
	}
	_startShake() {
		//摇奖点击
		if((!this._choose) && this._model == true) {
			Alert.alert('温馨提示', '请先选择你要下注的水果');
		} else {
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
	_getPrize() { //获奖
		const num = this._num;
		const itemArr1 = ['', 50, 100, 200];
		const itemArr2 = {
			item1: ["通讯录第六位", "在场名字中带N的", "左手边第三位"],
			item2: ["躺在桌子上", "一边唱征服一边", "站在凳子上"],
			item3: ["跳小苹果", "一起大喊我是超人", "互相说我是蠢货"]
		};

		let prizeArr = this._prizearr;
		let result = '';
		let res = 0;
		let add = 0;
		if (this._model) {
			for(let i=0; i < prizeArr.length; i++) {
				if(prizeArr[i] == num){
					res++;
				}
			}
			if(res == 1) {
				add = 0.5 * itemArr1[num];
			} else if(res == 2) {
				add = 1 * itemArr1[num];
			} else if(res == 3) {
				add = 3 * itemArr1[num];
			} else {

			}
			result = '押注中' + res + '个，获得：￥' + add;
			Alert.alert(result, '请注意查收余额', [
				{text: '确定', onPress: () => console.log('OK Pressed!')},
			]);
		} else {
			result = '和' + itemArr2.item1[prizeArr[0]-1] + itemArr2.item2[prizeArr[1]-1] + itemArr2.item3[prizeArr[2]-1];
		}

		const addAccount = this._account + add;
		this._account = addAccount;
		this._prizetext = result;
		this._choose = false;
		this.setState({
			_prizetext: result,
			_account: addAccount,
			_choose: false
		});
		//console.warn('中奖序列', this._prizearr);
	}
	_setGameModel() {
		this._prizearr = [];
		this._prizetext = '';
		const currentModel = this._model;
		this._model = !currentModel;
		this.setState({
			_model: !currentModel,
			_prizetext: '',
			_prizearr: []
		})
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
				scrollObject = -prizelevel * SCROLLITEM - 22;
				self._refSet(scrollRefer, scrollObject);
				self._prizenum++;
				if (self._prizenum === 3) {
					setTimeout(self._getPrize, 1000);
				}
				return false;
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
		};
		scroll();
	}
	_renderGameImage() {
		return (
			<View>
				<Image source={require('./assets/scroll_item_1.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/scroll_item_2.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/scroll_item_3.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/scroll_item_1.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/scroll_item_2.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/scroll_item_3.png')} style={styles.prizeLevel} />
			</View>
		)
	}
	_renderAImage() {
		return (
			<View>
				<Image source={require('./assets/a1.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/a2.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/a3.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/a1.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/a2.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/a3.png')} style={styles.prizeLevel} />
			</View>
		)
	}
	_renderBImage() {
		return (
			<View>
				<Image source={require('./assets/b1.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/b2.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/b3.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/b1.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/b2.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/b3.png')} style={styles.prizeLevel} />
			</View>
		)
	}
	_renderCImage() {
		return (
			<View>
				<Image source={require('./assets/c1.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/c2.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/c3.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/c1.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/c2.png')} style={styles.prizeLevel} />
				<Image source={require('./assets/c3.png')} style={styles.prizeLevel} />
			</View>
		)
	}
	_startScroll() {
		//清掉抽奖组
		this._prizearr = [];
		this._prizetext = '';
		this.setState({
			_prizetext: '',
			_prizearr: []
		});
		let cyclecount = Math.floor(Math.random() * 5) + 20;
		this._startScrollActurally(1, 4, cyclecount);
		cyclecount = Math.floor(Math.random() * 5) + 20;
		setTimeout(this._startScrollActurally, 1000, 2, 2, cyclecount);
		cyclecount = Math.floor(Math.random() * 5) + 20;
		setTimeout(this._startScrollActurally, 2000, 3, 1, cyclecount);
	}
	_showAccount() {
		Alert.alert('当前余额为：￥' + this._account, null, [
			{text: '确定', onPress: () => console.log('OK Pressed!')},
		]);
	}
	_checkChoose() {
		const arr1 = ['', '你选择了樱桃', '你选择了柠檬', '你选择了菠萝'];
		const arr2 = ['', '50', '100', '200'];
		if(this._num == 0) {
      Alert.alert('温馨提示', '你还没有任何下注');
		} else {
			if(this._choose){
        Alert.alert('温馨提示', '你已经下注了请点击摇杆进行游戏');
			}
			else {
        const self = this;

        Alert.alert(arr1[this._num], '将会扣取你￥' + arr2[this._num], [
          {text: '取消', onPress: () => console.log('OK Pressed!')},
          {text: '确认下注', onPress: () => self._setChoose()},
        ]);
			}
		}
	}
	_setChoose() {
		const arr = ['', 50, 100, 200];
		const currentAccount = this._account - arr[this._num];
		this._choose = true;
		this._account = currentAccount;
		this.setState({
			_choose: true,
			_account: currentAccount
		});
	}
	render() {
		return (
			<View style={styles.background}>
				<View style={styles.container}>
					<View>
						<Text style={styles.title}>疯狂老虎机</Text>
					</View>
					<View>
						<Text style={styles.account} onPress={this._showAccount}>￥{this._account}</Text>
					</View>
				</View>
				<Image source={require('./assets/background.png')} style={styles.scene}>
					{   this._model ?
						<View>
							<View>
								<TouchableOpacity onPress={() => this._setNum(1)} activeOpacity={1}>
									<Image source={require('./assets/choose_btn_3.png')} style={styles.choosebtn1}/>
								</TouchableOpacity>
							</View>
							<View>
								<TouchableOpacity onPress={() => this._setNum(2)} activeOpacity={1}>
									<Image source={require('./assets/choose_btn_1.png')} style={styles.choosebtn2}/>
								</TouchableOpacity>
							</View>
							<View>
								<TouchableOpacity onPress={() => this._setNum(3)} activeOpacity={1}>
									<Image source={require('./assets/choose_btn_2.png')} style={styles.choosebtn3}/>
								</TouchableOpacity>
							</View>
							<View>
								{ this._num == 0 &&
								<Text style={styles.notice}>
									你还没有选择下注的水果
								</Text>
								}
								{ this._num == 1 &&
								<Text style={styles.notice}>
									你选择了樱桃
								</Text>
								}
								{ this._num == 2 &&
								<Text style={styles.notice}>
									你选择了柠檬
								</Text>
								}
								{ this._num == 3 &&
								<Text style={styles.notice}>
									你选择了菠萝
								</Text>
								}
							</View>
							<View>
								<TouchableOpacity onPress={this._checkChoose} activeOpacity={1}>
									<Image source={require('./assets/choose_ok.png')} style={styles.chooseend}/>
								</TouchableOpacity>
							</View>
						</View>
						:
						<View>
							<Text style={styles.notice}>大冒险模式</Text>
						</View>
					}
					<View style={styles.prizeScrollContainer}>
						<View style={{flexDirection:'row',justifyContent:'space-between',position:'absolute',left:0,height:40,alignItems:'center',marginRight: 20,backgroundColor:'transparent',transform:[{translateX:WORDPOSITION}]}} ref={WORDCONTAINER}>
							<Text style={styles.word}>{this._prizetext}</Text>
							<Text style={styles.word}>{this._prizetext}</Text>
							<Text style={styles.word}>{this._prizetext}</Text>
							<Text style={styles.word}>{this._prizetext}</Text>
							<Text style={styles.word}>{this._prizetext}</Text>
						</View>
					</View>
					<TouchableOpacity onPress={this._setGameModel} activeOpacity={1}>
						<View style={styles.desc}>{false}</View>
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
								{	this._model ?
									this._renderGameImage()
									:
									this._renderAImage()
								}
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
								{	this._model ?
									this._renderGameImage()
									:
									this._renderBImage()
								}
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
								{	this._model ?
									this._renderGameImage()
									:
									this._renderCImage()
								}
							</Animated.View>
						</View>
					</View>
					<TouchableOpacity onPress={this._startShake} activeOpacity={1}>
						<Animated.Image source={require('./assets/btn_start.png')} style={[styles.starbtn,{transform:[{translateY:this.state.transformYValue},{rotateX:this.state.rotateXValue +'deg'}]}]} />
					</TouchableOpacity>
				</Image>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	background: {
		backgroundColor: '#282828',
	},
	container: {
		paddingTop: 20,
		flexDirection: 'column',
		height: 60,
		backgroundColor: '#f7b908',
		justifyContent: 'center',
	},
	title: {
		alignSelf: 'center',
		color: '#FFFFFF',
		fontWeight: 'bold',
		fontSize: 16
	},
	account: {
		marginTop: -18,
		marginRight: 10,
		alignSelf: 'flex-end',
		color: '#FFFFFF',
		fontWeight: 'bold',
		fontSize: 16
	},
	scene: {
		width: windowWidth,
		height: windowHeight,
	},
	choosebtn1: {
		position: 'absolute',
		flexDirection: 'row',
		marginTop: 12,
		marginLeft: windowWidth * 0.02,
		width: windowWidth * 0.30,
		height: windowHeight * 0.06,
	},
	choosebtn2: {
		position: 'absolute',
		flexDirection: 'row',
		marginTop: 12,
		left: windowWidth * 0.35,
		width: windowWidth * 0.30,
		height: windowHeight * 0.06,
	},
	choosebtn3: {
		position: 'absolute',
		flexDirection: 'row',
		marginTop: 12,
		left: windowWidth * 0.68,
		width: windowWidth * 0.30,
		height: windowHeight * 0.06,
	},
	notice: {
		position: 'relative',
		color: '#FFFFFF',
		textAlign: 'center',
		top: windowHeight * 0.108,
		fontSize: 16,
	},
	chooseend: {
		position: 'absolute',
		marginTop: windowHeight * 0.146,
		width: windowWidth,
		height: windowHeight * 0.056,
	},
	starbtn: {
		position: 'absolute',
		width: windowWidth * 0.09375,
		height: windowHeight * 0.1080,
		left: windowWidth * 0.8135,
		top: windowHeight * 0.39,
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
		marginTop: 4,
		marginRight: 20,
		fontSize: 15,
		color: '#88F1F6',
		backgroundColor: 'transparent'
	}
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);