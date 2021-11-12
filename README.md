### react-native-wechat-lib



安装: `yarn add eather-react-native-wechat`

## 注意事项

<details>
<summary>iOS: 微信授权登录 Universal Link(通用链接)</summary>

> [Universal Link(通用链接)](https://developer.apple.com/documentation/safariservices/supporting_associated_domains)是苹果在 iOS9 推出的，一种能够方便的通过传统 HTTPS 链接来启动 APP 的功能，可以使用相同的网址打开网址和 APP。  
> 看起来就是一条普通的 https 链接，当然是我们在该链接域名根目录配置过的一个链接，也可以在该链接中放置对应的H5页面。当用户的点击该链接，只要手机中安装了支持该链接的 APP 就会直接进入到 APP 中。如果没有安装APP则会跳转到 Safari 浏览器中，展示 H5 页面。对用户来说则是一个无缝跳转的过程。  

创建一个名为 `apple-app-site-association` 的文件，如下：

```json
{
  "applinks": {
    "details": [
      {
        "appID": "968DSZ49MT.com.uiwjs.react.example.wechat",
        "paths": ["/react-native-wechat/*"]
      }
    ]
  }
}
```

**说明：** 字段 appID 中的 `968DSZ49MT` 表示苹果账号的团队 `ID`，`com.uiwjs.react.example.wechat` 表示项目的 `BundleID`。

```
<Application Identifier Prefix>.<Bundle Identifier>
```

上传该文件到你的域名所对应的`根目录`或`xxx目录`下，`apple-app-site-association` 文件不需要扩展名。

**注意：** 苹果提供了一个[网页来验证](https://search.developer.apple.com/appsearch-validation-tool/)我们编写的这个 [apple-app-site-association](https://search.developer.apple.com/appsearch-validation-tool/) 是否合法有效。

```
https://<fully qualified domain>/.well-known/apple-app-site-association
根目录
https://uiwjs.github.io/apple-app-site-association

xxx目录
https://uiwjs.github.io/react-native-wechat/apple-app-site-association
```

打开 `Associated Domains` 开关，将 [`Universal Links`](https://developer.apple.com/documentation/safariservices/supporting_associated_domains) 域名加到配置上，如果 `URL` 地址是 https://uiwjs.github.io/apple-app-site-association，那么，
`Associated Domains` 中填写 `applinks: uiwjs.github.io`。

<img src="https://user-images.githubusercontent.com/1680273/89387904-c796aa80-d735-11ea-973c-f386f46cd16f.png" />

登录苹果开发者后台，在设置证书的页面找到 `Identifiers` 里，在对应的 `BundleId` 下勾选 `Associated Domains`

<img src="https://user-images.githubusercontent.com/1680273/89388154-32e07c80-d736-11ea-9724-e94cf6d468ca.png" />

</details>

<details>
<summary>iOS: -canOpenURL: failed for URL: "weixin://".</summary>

> ```
> -canOpenURL: failed for URL: "weixin://" - error: "The operation couldn’t be completed. (OSStatus error -10814.)"
> ```

设置 URL Schemes 并列为白名单，在 [`ios/<应用名称>/Info.plist`](https://github.com/uiwjs/react-native-wechat/blob/f6caea5b7d58dd05b7fc110ff76295c5e2be927b/example/ios/example/Info.plist#L23-L43) 中添加

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>weixin</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>wx500b695a47bd364b</string>
    </array>
  </dict>
</array>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>weixin</string>
  <string>weixinULAPI</string>
</array>
```

</details>

<details>
<summary>iOS: RCTBridge required dispatch_sync to load RCTDevLoadingView.</summary>

> 错误内容： RCTBridge required dispatch_sync to load RCTDevLoadingView. This may lead to deadlocks

**错误解决方案**：可以通过下面代码可以解决，事实上我通过关闭 debug 浏览器页面就没有错误消息了。错误原因可能是你打开了 debug 浏览器，但是你模拟器并没有开启 debug 模式。

```diff
+ #if RCT_DEV
+ #import <React/RCTDevLoadingView.h>
+ #endif

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

+  #if RCT_DEV
+    [bridge moduleForClass:[RCTDevLoadingView class]];
+  #endif
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"example" initialProperties:nil];
```

</details>





#### 一、接入指南
  - ##### 安卓

    1. 在项目的`android/app`目录下找到`build.gradle`文件，并在`dependencies`加入下面的依赖

       ```groovy
       dependencies {
           ......
           // 微信SDK
           // Android Studio环境下：已改用gradle形式，发布到jcenter，请开发者使用gradle来编译、更新微信SDK。
           // 在build.gradle文件中，添加如下依赖即可：
           implementation 'com.tencent.mm.opensdk:wechat-sdk-android-without-mta:+'
           ......
       }
       ```

    2. 新建消息接收类

       1. 微信支付：在项目的根`package`下新建一个子`package`叫`wxapi`,然后新建一个名为`WXPayEntryActivity`的类

          ```java
          package xxx.xxx.wxapi; // 根package的名称可以在AndroidManifest.xml的manifest中找到
          
          import android.app.Activity;
          import android.os.Bundle;
          import android.util.Log;
          import com.tencent.mm.opensdk.modelbase.BaseReq;
          import com.tencent.mm.opensdk.modelbase.BaseResp;
          import com.tencent.mm.opensdk.openapi.IWXAPI;
          import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
          import com.tencent.mm.opensdk.openapi.WXAPIFactory;
          
          import net.sourceforge.simcpux.RNWechatModule;
          
          public class WXPayEntryActivity extends Activity implements IWXAPIEventHandler {
              private IWXAPI api = null;
          
              @Override
              protected void onCreate(Bundle savedInstanceState) {
                  super.onCreate(savedInstanceState);
                  api = WXAPIFactory.createWXAPI(this, "微信的appId");
                  api.handleIntent(getIntent(), this);
              }
          
              @Override
              protected void onStart() {
                  super.onStart();
                  finish();
              }
          
              @Override
              public void onReq(BaseReq baseReq) {
          
              }
          
              @Override
              public void onResp(BaseResp baseResp) {
                  Log.d("WXPAY", "onPayFinish, errCode = " + baseResp.errCode);
                  RNWechatModule.sendReqPromise.resolve(baseResp.errCode);
          
              }
          }
          ```
        2、微信登录认证：同上，在`wxapi`包下再新建一个名为`WXPayEntryActivity`的类
        ```java
        package xx.xx.wxapi;
        import android.app.Activity;
        import android.os.Bundle;
        import android.util.Log;

        import com.facebook.react.bridge.Arguments;
        import com.facebook.react.bridge.WritableMap;
        import com.tencent.mm.opensdk.modelbase.BaseReq;
        import com.tencent.mm.opensdk.modelbase.BaseResp;
        import com.tencent.mm.opensdk.modelmsg.SendAuth;
        import com.tencent.mm.opensdk.openapi.IWXAPI;
        import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
        import com.tencent.mm.opensdk.openapi.WXAPIFactory;

        import net.sourceforge.simcpux.RNWechatModule;

        public class WXEntryActivity extends Activity implements IWXAPIEventHandler {
            private IWXAPI api = null;

            @Override
            protected void onCreate(Bundle savedInstanceState) {
                super.onCreate(savedInstanceState);
                api = WXAPIFactory.createWXAPI(this, "微信的appId");
                api.handleIntent(getIntent(), this);
            }

            @Override
            protected void onStart() {
                super.onStart();
                finish();
            }

            @Override
            // 微信请求应用的响应结果回调
            public void onReq(BaseReq baseReq) {

            }

            @Override
            // 应用请求微信的响应结果回调
            public void onResp(BaseResp baseResp) {

                Log.d("WXLogin", "onLoginFinish, errCode = " + baseResp.errCode);
                SendAuth.Resp resp = (SendAuth.Resp) baseResp;
                WritableMap params = Arguments.createMap();
                params.putInt("errCode",  baseResp.errCode); // 错误码
                params.putString("code",  resp.code); // 用户换取 access_token 的 code，仅在 ErrCode 为 0 时有效
                params.putString("state",  resp.state); // state是用来做标识请求唯一性
                // lang、country，语言与国家两个字段需要可自行加入返回数据中

                RNWechatModule.sendReqPromise.resolve(params);

            }
        }
        ```

    1. 在`AndroidManifest.xml`中加入对应的`activity`

       1. 微信支付

          ```xml
          <activity
                      android:name=".wxapi.WXPayEntryActivity"
                      android:exported="true"
                      android:launchMode="singleTop"
                      android:theme="@android:style/Theme.NoDisplay" />
          ```
      2. 微信登录认证
          
          ```xml
            <activity
              android:name=".wxapi.WXEntryActivity"
              android:label="应用名"
              android:theme="@android:style/Theme.Translucent.NoTitleBar"
              android:exported="true"
              android:taskAffinity="xx.xx.wxapi"
              android:launchMode="singleTask">

            <!-- android:taskAffinity="xx.xx.wxapi" 需要替换为你自己的包名 -->
          ```

- ##### iOS

  1. 先 `cd` 到 `ios` 目录下，运行`pod install`

  2. 事件通知

     1. 在`AppDelegate.m`文件中添加依赖库

        ```objective-c
        #import <WXApi.h>
        #import <RNWechat/RNWechat.h>
        ```

     2. 添加微信消息接收事件的方法

        ```objective-c
        //ios9以后
        - (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary*)options {
         return  [WXApi handleOpenURL:url delegate:self];
        }
        //ios9以后的方法
        - (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
         return [WXApi handleOpenURL:url delegate:self];
        }
        //ios9以前
        - (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url {
         return  [WXApi handleOpenURL:url delegate:self];
        }
        
        #pragma mark - wx callback
        
        - (void) onReq:(BaseReq*)req
        {
         // TODO Something
        }
        
        - (void)onResp:(BaseResp *)resp
        {
          // 登录认证的类型 
          if([resp isKindOfClass:[SendAuthResp class]])
          {
            // 需要注意的是 resolver、rejecter 登录认证、支付是不同的方法，不能混用
            RCTPromiseResolveBlock resolver = [RNWechat getSendLoginResolverStatic];
            RCTPromiseRejectBlock rejecter = [RNWechat getSendLoginRejecterStatic];
            // 登录认证返回结果
            NSString *loginResult = [NSString stringWithFormat:@"errcode:%d", resp.errCode];
                //登录认证返回结果，实际支付结果需要去微信服务器端查询
            switch (resp.errCode) {
              case 0:
                loginResult = @"登录认证结果：成功！";
                break;
              case -1:
                loginResult = @"登录认证结果：失败！";
                break;
              case -2:
                loginResult = @"用户已经退出登录认证！";
                break;
              default:
                loginResult = [NSString stringWithFormat:@"登录认证结果：失败！retcode = %d, retstr = %@", resp.errCode,resp.errStr];
                break;
            }
            NSLog(@"微信登录：%@", loginResult);
            SendAuthResp *sendResp = (SendAuthResp *)resp;
            NSDictionary *params = @{
              @"errCode": [NSString stringWithFormat:@"%d", sendResp.errCode],
              @"code": [NSString stringWithFormat:@"%@", sendResp.code],
              @"state": [NSString stringWithFormat:@"%@", sendResp.state],
            };
            resolver(params);
          
            NSLog(@"WeChatSDK---------: %@", loginResult);
            
          }
          
        //判断是否是微信支付回调类型 (注意是PayResp 而不是PayReq)
        if ([resp isKindOfClass:[PayResp class]])
        {
          RCTPromiseResolveBlock resolver = [RNWechat getSendPayResolverStatic];
          RCTPromiseRejectBlock rejecter = [RNWechat getSendPayRejecterStatic];
          //启动微信支付的response
              NSString *payResoult = [NSString stringWithFormat:@"errcode:%d", resp.errCode];
              if([resp isKindOfClass:[PayResp class]]){
                  //支付返回结果，实际支付结果需要去微信服务器端查询
                  switch (resp.errCode) {
                      case 0:
                          payResoult = @"支付结果：成功！";
                          break;
                      case -1:
                          payResoult = @"支付结果：失败！";
                          break;
                      case -2:
                          payResoult = @"用户已经退出支付！";
                          break;
                      default:
                          payResoult = [NSString stringWithFormat:@"支付结果：失败！retcode = %d, retstr = %@", resp.errCode,resp.errStr];
                          break;
                  }
                resolver(@(resp.errCode));
              } else {
                rejecter(@"-10404", @"失败", nil);
              }
          NSLog(@"WeChatSDK: %@", payResoult);
        }
        }
        - (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler{
          return [WXApi handleOpenUniversalLink:userActivity delegate:self];
        }
        
        ```



#### 二、 文档说明

```ts

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

```



#### 三、使用示例

1. 注册、判断是否安装、支持微信示例
```js
import Wechat from 'eather-react-native-wechat';
const wechatInit = () => {
  await Wechat.registerApp(
        'wx7363cc9581927cb3',
        'https://www.52dian.com/app',
      ).then(res => {
        console.log(res, 'registerApp');
      });
      const _isInstall = await Wechat.isWXAppInstalled();
      const _isWXAppSupportApi = await Wechat.isWXAppSupportApi();
}
```
2、 微信登录示例
```js
  import Wechat from 'eather-react-native-wechat';
  const WXLogin = () => {
    let state = new Date().getTime(); // 这里state取值可根据项目实际设置，此处为简单示例
    Wechat.sendLoginRequest({state: state}).then((res: any) => {
      console.log('&**********微信登录请求', res);
      if (res.errCode === 0) { // 用户同意
        if (res.state === state) { // state是原样返回的数据,检测正常请求而非外部攻击
          // do
        }
      } else {
        // res.errCode === -4 用户拒绝
        // res.errCode === -2 用户取消
      }
    });
  };
```

