import { SPRESSO_DEVICE_COOKIE, SPRESSO_USER_COOKIE } from "./constants";
import {Browser} from "@shopify/web-pixels-extension";
import {GeneralProps, EventProps} from './types'
import { v4 as uuidv4 } from 'uuid';
import { BrowserCookie } from "node_modules/@shopify/web-pixels-extension/build/ts/types/PixelEvents";

export function getGeneralProperties(): GeneralProps {
    const currentTimestamp = new Date();
  
    return {
      uid: uuidv4(), // event identifier
      utcTimestampMs: currentTimestamp.getTime(),
      timezoneOffset: currentTimestamp.getTimezoneOffset() * 60 * 1000, // convert to milliseconds
    };
  }
  
export async function getEventProperties(browser: Browser): Promise<EventProps> {

    const deviceId = await getDeviceId(browser.cookie);
    const userId = await getUserId(browser.cookie);

    return {
      deviceId: deviceId,
      userId: userId || deviceId,
      isLoggedIn: userId != null,
      page: "nothing?", //can't get this info
      platform: 'Web',
      userAgent: navigator ? navigator.userAgent : '',
      version: '5.0.0', // TODO: can we read git hash instead?
    };
  }
  
  export async function getDeviceId (cookie: BrowserCookie) {
    let deviceId = await cookie.get(SPRESSO_DEVICE_COOKIE);
  
    if (!deviceId || deviceId === '') {
      deviceId = uuidv4();
      cookie.set(SPRESSO_DEVICE_COOKIE, deviceId);
    }
    return deviceId;
  };

  export async function getUserId (cookie: BrowserCookie) {
    return await cookie.get(SPRESSO_USER_COOKIE);
  };

  export const isValidLineItem = (val: any): boolean => {
    return (
      val != null && val != undefined && isValidString(val.productId) && isValidNumber(val.price)
    );
  };

  export const isValidString = (val: any | undefined | null): boolean => {
    if (val == null || val == undefined) {
      return false;
    }
  
    const strVal = String(val);
    return strVal.trim().length != 0;
  };
  
  export const isValidNumber = (val: any): boolean => {
    return Number.isFinite(Number.parseFloat(val));
  };
  