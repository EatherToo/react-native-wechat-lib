#import <React/RCTBridgeModule.h>
#import "WXApi.h"
#import "WXApiObject.h"

@interface RNWechat : NSObject <RCTBridgeModule, WXApiDelegate>

+ (RCTPromiseResolveBlock)getSendPayResolverStatic;

+ (RCTPromiseRejectBlock) getSendPayRejecterStatic;

+ (RCTPromiseResolveBlock)getSendLoginResolverStatic;

+ (RCTPromiseRejectBlock) getSendLoginRejecterStatic;

@property NSString* appId;
@end
