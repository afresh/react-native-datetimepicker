/**
 * DatePicker
 * @afresh
 * 2018-12-05
 */

import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    Modal,
    TouchableOpacity,
    Text,
    Picker,
    BackHandler,
    Dimensions,
    PixelRatio,
} from 'react-native';

import PickerEx from "react-native-picker";

const {height, width} = Dimensions.get('window');
const SCREEN_WIDTH = width;
const SCREEN_HEIGHT = height;
const basePx = Platform.OS === 'ios' ? 750 : 720;

const px2dp = (px) => {
    const layoutSize = (px / basePx) * width;
    return PixelRatio.roundToNearestPixel(layoutSize);
};

export const FONT_SIZE = (size) => {
    if (PixelRatio === 2) {
        // iphone 5s and older Androids
        if (width < 360) {
            return size * 0.95;
        }
        // iphone 5
        if (height < 667) {
            return size;
            // iphone 6-6s
        } else if (height >= 667 && height <= 735) {
            return size * 1.15;
        }
        // older phablets
        return size * 1.25;
    }
    if (PixelRatio === 3) {
        // catch Android font scaling on small machines
        // where pixel ratio / font scale ratio => 3:3
        if (width <= 360) {
            return size;
        }
        // Catch other weird android width sizings
        if (height < 667) {
            return size * 1.15;
            // catch in-between size Androids and scale font up
            // a tad but not too much
        }
        if (height >= 667 && height <= 735) {
            return size * 1.2;
        }
        // catch larger devices
        // ie iphone 6s plus / 7 plus / mi note 等等
        return size * 1.27;
    }
    if (PixelRatio === 3.5) {
        // catch Android font scaling on small machines
        // where pixel ratio / font scale ratio => 3:3
        if (width <= 360) {
            return size;
            // Catch other smaller android height sizings
        }
        if (height < 667) {
            return size * 1.2;
            // catch in-between size Androids and scale font up
            // a tad but not too much
        }
        if (height >= 667 && height <= 735) {
            return size * 1.25;
        }
        // catch larger phablet devices
        return size * 1.4;
    }
    // if older device ie pixelRatio !== 2 || 3 || 3.5
    return size;
};

/*
 * 获取year年的日期数组
 */
getYearDates = (year, lastYear = 0) => {
    let dates = [];
    if (lastYear === 0) {
        lastYear = (new Date()).getFullYear();
    }
    let firstYear = lastYear - year;
    let nowYear = (new Date()).getFullYear();
    let nowMonth = (new Date()).getMonth() + 1;
    let nowDay = (new Date()).getDate();
    for (let year = firstYear; year <= lastYear; year++) {
        let months = [];
        for (let month = 1; month <= 12; month++) {
            let days = [];
            let lastDay = lastYear === (new Date()).getFullYear() && nowYear === year && nowMonth === month ? nowDay : (new Date(year, month, 0)).getDate();
            for (let day = 1; day <= lastDay; day++) {
                days.push(day.toString());
            }
            let monthModel = {};
            monthModel[month.toString()] = days;
            months.push(monthModel);
        }
        let yearModel = {};
        yearModel[year.toString()] = months;
        dates.push(yearModel);
    }
    return dates;
};

/*
 * 30年的日期数组
 */
const DATES_30YEARS = getYearDates(30);

/*
 * 单位
 */
const UNIT = ["年", "月", "日"];

/*
 * 去掉日期中的年月日
 */
const removeYMD = (date) => {
    if (date instanceof Array) {
        return [removeYMD(date[0]), removeYMD(date[1]), removeYMD(date[2])];
    } else {
        return date.substring(0, date.length - 1);
    }
};

/*
 * 强制转换日期字符串为int型
 */
const convertToInt = (date) => {
    if (date instanceof Array) {
        return [convertToInt(date[0]), convertToInt(date[1]), convertToInt(date[2])];
    } else {
        return parseInt(date);
    }
};

class DatePicker extends Component {
    constructor(props) {
        super(props);
        let now = new Date();
        this.options = { //配置项
            title: "请选择", //标题
            data: DATES_30YEARS, //日期数据
            years: 30, //年数总和
            lastYear: 0, //最后一年，默认为0，表示今年
            selectedValue: Platform.OS === "android" ? [now.getFullYear(), (now.getMonth() + 1), now.getDate()] : [now.getFullYear().toString(), (now.getMonth() + 1).toString(), now.getDate().toString()], //默认选择值，安卓为int数组，苹果为string数组
            onPickerConfirm: false, //确定按钮回调
        };
        this._tempLevel = -1;
        this._tempSelectedValue = this.options.selectedValue; //上次选择值
        this._columnsIOS = []; //iOS列
        this.state = {
            modalVisible: !this.props.hide,
            options: this.options,
        }
    }

    componentWillMount(){
        BackHandler.addEventListener('hardwareBackPress', this._onBackAndroid);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this._onBackAndroid);
    }

    _onBackAndroid = () => {
        if (this.state.modalVisible) {
            //如果选择器呈显示状态，则拦截安卓物理回退键，并隐藏选择器
            this.hide();
            return true;
        }
        return false;
    };

    hide() {
        if (Platform.OS === 'android') {
            PickerEx.hide();
        }
        this.setState({modalVisible: false});
    }

    show(options) {
        //设置配置项
        if (!options) {
            options = this.options;
        } else {
            if (!options.title) {
                options.title = this.options.title;
            }
            if (options.years && options.lastYear) {
                if (options.years) {
                    if (options.lastYear) {
                        options.data = getYearDates(options.years, options.lastYear);
                    } else {
                        options.data = getYearDates(options.years);
                    }
                } else {
                    options.data = DATES_30YEARS;
                }
            } else {
                options.data = DATES_30YEARS;
            }
            if (options.selectedValue) {
                if (Platform.OS === "android") {
                    this.options.selectedValue = convertToInt(options.selectedValue.split("-"));
                } else {
                    let selectedValue = convertToInt(options.selectedValue.split("-"));
                    this.options.selectedValue = [selectedValue[0].toString(), selectedValue[1].toString(), selectedValue[2].toString()];
                }
            }
            options.selectedValue = this.options.selectedValue;
            if (!options.onPickerConfirm) {
                options.onPickerConfirm = this.options.onPickerConfirm;
            }
        }
        this._tempSelectedValue = options.selectedValue;
        this.setState({
            modalVisible: true,
            options: options,
        });
        console.log("options.selectedValue===" + JSON.stringify(this.state.options.selectedValue));
        if (Platform.OS === 'android') {
            //安卓调用插件
            this._initPickerAndroid(options);
        } else {
            //苹果使用RN的Picker
            this._initPickerIOS();
        }
    }

    /*
     * 初始化安卓选择器
     */
    _initPickerAndroid(options) {
        let self = this;
        let data = this._createPickerDataAndroid(options.data, 0);
        let selectedValue = this._createPickerValueAndroid(options.selectedValue);
        this._tempSelectedValue = selectedValue; //将默认选择值赋给_tempSelectedValue
        console.log("_initPickerAndroid.selectedValue===" + JSON.stringify(selectedValue));
        PickerEx.init({
            pickerData: data, //日期数据，Array
            selectedValue: selectedValue, //默认选择值，Array
            pickerTitleText: options.title, //标题，string
            pickerConfirmBtnText: "确定", //确定按钮文本
            pickerCancelBtnText: "取消", //取消按钮文本
            pickerTitleColor: [12, 12, 12, 1], //标题颜色
            pickerConfirmBtnColor: [246, 98, 98, 1], //确定按钮文字颜色
            pickerCancelBtnColor: [153, 153, 153, 1], //取消按钮文字颜色
            onPickerConfirm: function (chosedData) {
                if (false !== options.onPickerConfirm) {
                    let newChosedData = removeYMD(chosedData);
                    let value = newChosedData[0] + "-" + ("00" + newChosedData[1]).slice(-2) + "-" + ("00" + newChosedData[2]).slice(-2);
                    options.onPickerConfirm(value);
                }
                self.setState({modalVisible: false});
                console.log("onPickerConfirm===", chosedData);
            },
            onPickerCancel: chosedData => {
                self.setState({modalVisible: false});
                console.log("onPickerCancel===", chosedData);
            },
            onPickerSelect: chosedData => {
                console.log("onPickerSelect.chosedData===", chosedData);
                const tempSelectedValue = removeYMD(self._tempSelectedValue);
                const tempChosedData = removeYMD(chosedData);
                let targetChosedData;
                if (tempChosedData[0] === tempSelectedValue[0]) {
                    if (tempChosedData[1] === tempSelectedValue[1]) {
                        //重新选择了日
                        targetChosedData = [tempChosedData[0] + "年", tempChosedData[1] + "月", tempChosedData[2] + "日"];
                    } else {
                        //重新选择了月
                        if (tempChosedData[1] === "2") {
                            //选择了2月
                            if (convertToInt(tempChosedData[0]) % 4 === 0 && convertToInt(tempSelectedValue[2]) > 29) {
                                //选择了闰2月，且上次日期大于29
                                targetChosedData = [tempChosedData[0] + "年", tempChosedData[1] + "月", "29日"];
                            } else if (convertToInt(tempChosedData[0]) % 4 !== 0 && convertToInt(tempSelectedValue[2]) > 28) {
                                //选择了2月，且上次日期大于28
                                targetChosedData = [tempChosedData[0] + "年", tempChosedData[1] + "月", "28日"];
                            } else {
                                targetChosedData = [tempChosedData[0] + "年", tempChosedData[1] + "月", tempSelectedValue[2] + "日"];
                            }
                        } else if (["4", "6", "9", "11"].indexOf(tempChosedData[1]) > -1 && convertToInt(tempSelectedValue[2]) > 30) {
                            //选择了4,6,9,11月，且上次日期大于30
                            targetChosedData = [tempChosedData[0] + "年", tempChosedData[1] + "月", "30日"];
                        } else {
                            targetChosedData = [tempChosedData[0] + "年", tempChosedData[1] + "月", tempSelectedValue[2] + "日"];
                        }
                    }
                } else {
                    //重新选择了年
                    //选择了2月
                    if (convertToInt(tempChosedData[0]) % 4 === 0 && convertToInt(tempSelectedValue[1]) === 2 && convertToInt(tempSelectedValue[2]) > 29) {
                        //选择了闰2月，且上次日期大于29
                        targetChosedData = [tempChosedData[0] + "年", tempSelectedValue[1] + "月", "29日"];
                    } else if (convertToInt(tempChosedData[0]) % 4 !== 0 && convertToInt(tempSelectedValue[1]) === 2 && convertToInt(tempSelectedValue[2]) > 28) {
                        //选择了2月，且上次日期大于28
                        targetChosedData = [tempChosedData[0] + "年", tempSelectedValue[1] + "月", "28日"];
                    } else {
                        targetChosedData = [tempChosedData[0] + "年", tempSelectedValue[1] + "月", tempSelectedValue[2] + "日"];
                    }
                }
                self._tempSelectedValue = targetChosedData;
                PickerEx.select(targetChosedData);
                console.log("onPickerSelect.targetChosedData===", JSON.stringify(targetChosedData));
            },
        });
        PickerEx.show();
    }

    /*
      * 创建选择器结构数据（安卓）
      */
    _createPickerDataAndroid(data, level) {
        let newData = [];
        for (let index = 0; index < data.length; index++) {
            if (data[index] && typeof data[index] === "object") {
                for (let key in data[index]) {
                    if (data[index][key] && data[index][key].length > 0) {
                        let item = {};
                        let children = this._createPickerDataAndroid(data[index][key], level + 1);
                        item[key + UNIT[level]] = children;
                        newData.push(item);
                    }
                }
            } else {
                newData.push(data[index] + UNIT[level]);
            }
        }
        return newData;
    }

    /*
      * 创建带单位的初始值（安卓）
      */
    _createPickerValueAndroid = (selectedValue) => {
        let newSelectedValue = [];
        for (let index = 0; index < selectedValue.length; index++) {
            newSelectedValue.push(selectedValue[index] + UNIT[index]);
        }
        return newSelectedValue;
    };

    /*
     * 初始化苹果选择器
     */
    _initPickerIOS(options) {

    }

    /*
     * 确定（苹果）
     */
    _confirmIOS() {
        console.log("_confirmIOS===", this.state.options.selectedValue);
        if (false !== this.state.options.onPickerConfirm) {
            let value = this.state.options.selectedValue[0] + "-" + ("00" + this.state.options.selectedValue[1]).slice(-2) + "-" + ("00" + this.state.options.selectedValue[2]).slice(-2);
            this.state.options.onPickerConfirm(value);
        }
        this.setState({modalVisible: false});
    }

    /*
     * 选择事件（苹果）
     */
    _onPickerSelectIOS(itemValue, level) {
        console.log("_onPickerSelectIOS.itemValue===", itemValue + "," + level);
        if (this._tempLevel === -1) {
            this._tempLevel = level;
        }
        let value = [...this.state.options.selectedValue];
        const tempSelectedValue = this._tempSelectedValue;
        console.log("tempSelectedValue===", JSON.stringify(tempSelectedValue));
        if (level === 1) {
            //重新选择了月
            value[1] = itemValue;
            if (convertToInt(itemValue) === 2) {
                //选择了2月
                if (convertToInt(value[0]) % 4 === 0 && convertToInt(tempSelectedValue[2]) > 29) {
                    //选择了闰2月，且上次日期大于29
                    value[2] = "29";
                } else if (convertToInt(value[0]) % 4 !== 0 && convertToInt(tempSelectedValue[2]) > 28) {
                    //选择了2月，且上次日期大于28
                    value[2] = "28";
                } else {
                    value[2] = tempSelectedValue[2];
                }
            } else if (["4", "6", "9", "11"].indexOf(itemValue) > -1 && convertToInt(tempSelectedValue[2]) > 30) {
                //选择了4,6,9,11月，且上次日期大于30
                value[2] = "30";
            } else {
                value[2] = tempSelectedValue[2];
            }
        } else if (level === 0) {
            //重新选择了年
            value[0] = itemValue;
            value[1] = tempSelectedValue[1];
            if (convertToInt(itemValue) % 4 === 0 && convertToInt(tempSelectedValue[1]) === 2 && convertToInt(tempSelectedValue[2]) > 29) {
                //选择了闰2月，且上次日期大于29
                value[2] = "29";
            } else if (convertToInt(itemValue) % 4 !== 0 && convertToInt(tempSelectedValue[1]) === 2 && convertToInt(tempSelectedValue[2]) > 28) {
                //选择了2月，且上次日期大于28
                value[2] = "28";
            } else {
                value[2] = tempSelectedValue[2];
            }
        } else {
            value[2] = itemValue;
        }
        console.log("_onPickerSelectIOS.value===", value);
        //_tempLevel这个参数是为了解决选择月份的时候产生的bug，不知道哪里逻辑错了。
        // if (this._tempLevel === 1) {
        //     if (level === 2) {
        //         this._tempLevel = -1;
        //         return;
        //     } else {
        //         this._tempLevel = 1;
        //     }
        // } else {
        //     this._tempLevel = -1;
        // }
        this._tempSelectedValue = value;
        this.state.options.selectedValue = value;
        this.setState({
            options: this.state.options,
        });
    }

    /*
     * 创建选择器单条数据（苹果）
     */
    _createPickerItemsIOS(data, level) {
        // console.log("_createPickerItemsIOS===" + level + JSON.stringify(data));
        let pickerItems = [];
        for (let index = 0; index < data.length; index++) {
            if (data[index] && typeof data[index] === "object") {
                for (let key in data[index]) {
                    let value = data[index][key];
                    if (key === this.state.options.selectedValue[level]) {
                        if (value && value.length > 0) {
                            this._createPickerIOS(value, level + 1);
                        }
                    }
                    pickerItems.push(
                        <Picker.Item key={level + "-" + index} label={key} value={key} />
                    );
                }
            } else {
                pickerItems.push(
                    <Picker.Item key={level + "-" + index} label={data[index]} value={data[index]} />
                );
            }
        }
        return pickerItems;
    }

    /*
     * 创建选择器（苹果）
     */
    _createPickerIOS(data, level) {
        // console.log("_createPickerIOS===" + level + JSON.stringify(data));
        let column = (
            <View key={"Picker" + level} style={[styles.picker]}>
                <Picker
                    style={[styles.picker_list]}
                    itemStyle={[styles.picker_item]}
                    prompt={this.state.options.title + "(" + UNIT[level] + ")"}
                    mode = 'dialog'
                    selectedValue={this.state.options.selectedValue[level]}
                    onValueChange={(itemValue) => this._onPickerSelectIOS(itemValue, level)}
                >
                    {this._createPickerItemsIOS(data, level)}
                </Picker>
                <Text style={[styles.picker_unit]}>{UNIT[level]}</Text>
            </View>
        );
        this._columnsIOS.push(column);
    }

    /*
     * 渲染列（苹果）
     */
    _renderColumnsIOS() {
        this._columnsIOS = [];
        this._createPickerIOS(this.state.options.data, 0);
        return (
            <View style={[styles.body]}>
                {this._columnsIOS}
            </View>
        )
    }

    render() {
        if (!this.state.modalVisible) {
            return null
        }
        if (Platform.OS === 'android') {
            return (
                <TouchableWithoutFeedback style={[styles.mask]} onPress={() => this.hide()}>
                    <View style={[styles.mask, {position: 'absolute', top: 0, left: 0}]} />
                </TouchableWithoutFeedback>
            );
        } else {
            return (
                <Modal
                    visible={this.state.modalVisible}
                    transparent={true}
                    animationType = "fade"
                    onRequestClose={() => {this.hide()}}
                >
                    <View style={[styles.mask]}>
                        <View style={[styles.container]}>
                            <View style={[styles.header]}>
                                <TouchableOpacity onPress={() => this.hide()}>
                                    <View style={[styles.header_cancel]}>
                                        <Text style={[styles.header_cancel_text]}>取消</Text>
                                    </View>
                                </TouchableOpacity>
                                <Text style={[styles.header_title]}>{this.state.options.title}</Text>
                                <TouchableOpacity onPress={() => this._confirmIOS()}>
                                    <View style={[styles.header_confirm]}>
                                        <Text style={[styles.header_confirm_text]}>确定</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            {this._renderColumnsIOS()}
                        </View>
                    </View>
                </Modal>
            );
        }
    }
}

const styles = StyleSheet.create({
    mask: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        flex: 1,
        flexDirection: 'column-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#ffffff',
        width: SCREEN_WIDTH,
        height: px2dp(500),
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    header: {
        width: SCREEN_WIDTH,
        height: px2dp(100),
        paddingLeft: px2dp(20),
        paddingRight: px2dp(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    header_cancel: {
        width: px2dp(128),
        height: px2dp(36),
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    header_cancel_text: {
        height: px2dp(36),
        lineHeight: px2dp(36),
        fontSize: FONT_SIZE(16),
        color: 'rgba(153, 153, 153, 1)',
    },
    header_title: {
        height: px2dp(36),
        lineHeight: px2dp(36),
        color: 'rgba(12, 12, 12, 1)',
    },
    header_confirm: {
        width: px2dp(128),
        height: px2dp(36),
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    header_confirm_text: {
        height: px2dp(36),
        lineHeight: px2dp(36),
        color: 'rgba(246, 98, 98, 1)',
    },
    body: {
        backgroundColor: '#ffffff',
        width: SCREEN_WIDTH,
        height: px2dp(400),
        flexDirection: 'row-reverse',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    picker: {
        maxWidth: px2dp(720),
        minWidth: px2dp(180),
        height: px2dp(400),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    picker_list: {
        maxWidth: px2dp(720),
        minWidth: px2dp(180),
        height: px2dp(400),
        flexDirection: 'column',
        justifyContent: 'center',
    },
    picker_item: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: FONT_SIZE(17),
    },
    picker_unit: {
        width: px2dp(80),
        height: px2dp(400),
        lineHeight: px2dp(400),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
});

export default DatePicker;