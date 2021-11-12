
/**
 * 向微信注册应用
 * 必须先注册应用，在 Android 后面的调用才会起作用
 * @param appid 通过微信开放平台，[获取appid](https://open.weixin.qq.com/)
 * @param universalLink 参数在 iOS 中有效，Universal Link(通用链接)是苹果在 iOS9 推出的，一种能够方便的通过传统 HTTPS 链接来启动 APP 的功能，可以使用相同的网址打开网址和 APP。
 */
export function registerApp(appid: string, universalLink: string): Promise<any>;
/**
 * 检查微信是否已被用户安装  
 * 微信已安装返回 `true`，未安装返回 `false`。
 */
export function isWXAppInstalled(): Promise<boolean>;
/**
 * 判断当前微信的版本是否支持 OpenApi  
 * 支持返回 `true`，不支持返回 `false`
 */
export function isWXAppSupportApi(): Promise<boolean>;
/**
 * 打开微信，成功返回 `true`，不支持返回 失败返回 `false`
 */
export function openWXApp(): Promise<boolean>;
/**
 * 获取当前微信SDK的版本号
 */
export function getApiVersion(): Promise<string>; 


export type RequestOption = {
  appId: string;
  partnerId: string;
  prepayId: string;
  nonceStr: string;
  timestamp: string;
  packageValue: string;
  sign: string;
  extData?: string;
}
/**
 * 发送请求支付请求
 */
export function sendPayRequest(requestOption: RequestOption) : Promise<any>;

/**
 * 发送登录认证请求
 * @param state 唯一标识码
 */
export function sendLoginRequest(requestOption: {state: string}) : Promise<any>;