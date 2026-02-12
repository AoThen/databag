var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/session.ts
import { EventEmitter as EventEmitter11 } from "eventemitter3";

// src/settings.ts
import { EventEmitter } from "eventemitter3";

// src/entities.ts
var defaultConfigEntity = {
  disabled: false,
  storageUsed: 0,
  storageAvailable: 0,
  forwardingAddress: "",
  searchable: false,
  allowUnsealed: false,
  pushEnabled: false,
  seal: {
    passwordSalt: "",
    privateKeyIv: "",
    privateKeyEncrypted: "",
    publicKey: ""
  },
  sealable: false,
  enableIce: false,
  mfaEnabled: false,
  webPushKey: ""
};
var defaultProfileEntity = {
  guid: "",
  handle: "",
  name: "",
  description: "",
  location: "",
  image: "",
  revision: 0,
  version: "",
  node: ""
};
var avatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAAACXBIWXMAACxLAAAsSwGlPZapAAAP4UlEQVR42u2d63MTZ5aHz2ndZcs3jA0emFSRAEPIJBPLu0U2s7OVmUzV/MVbs1vMzE6S2Ww2koBwx7AEjO+SLal17+737AcwAQIGSy2pT/fv+eCiXMZWd5+nz3nvvLq6SgBEFQu3AEAAACAAABAAAAgAAAQAAAIAAAEAgAAAQAAAIAAAEAAACAAABAAAAgAAAQCAAABAAAAgAAAQAAAIAAAEiDb8wtdDfuD5v/l13wf+E8ctGAnywlciIiPkmYOXEFPMkp/98LMfhAMQQGW8d13qOqbjcNelnksNp/XE3H6X/7vI788lZxIxSSasTIJTcUkn4AAECGJVIy+GfNshu0Otntxp33Sp0/fv3ZYH291Xv5mh6TPpDybTPJGSbPLpn2YmlpfSBTj6U8TOcIPcvbZjam2x23S3VxrlHz6XzE9naCrNmST/rGoCEGB4b3oiIu46UmnKbft+m2rjzuDpX09ePJ6jZJx/VoWhcIIAvuJ6tGtT0S4E8+Mt55YXpqy4RQehj7QAAXzC7tBO3dzuloL/Uc8n8yenaSLFzEgCEGAwPEPVFn27X9D44f9lbmU6SzFmpAIIcCSEiF1DFVu+rxe1X8zKVH5+kuIxCxpAgHe9J7u2+a5aDNMlXZrJH8sx6iEI8BZqbfq6XAjr1f322MpM9qcsh8dNmAv0HNfQzU0nxNFPRN9UCne3jOMSoh8Z4CU2aqZUL0XnevNT+RPTFqNVAAHaDl3Z3t6TtahdeIamPz9xNp14mg2iO+UusgIwiWzWpGgXo+z/ytTy4pTFEe4qjWgboOfK3e2oRz8RFeqlu1vietGthSKYAdjumL/vRj30X+GLhZWJFDJABNiuI/pfw992Cls1EQgQ3pKfRehRRb6vIfrfVA4VH5XFCAQII56YW1vu9Rai/zButIur2+b5Wk0IEJomL/2w0XroXkWIv5VVp/TdxrZrIEBYMEL/uVl4x/W4gIj2ZO3y+g3XoygMDoRcAMeTf39SQEwfFZc6f94oOBEohsIsgOvRVxv3Ec198x8bRSfsQwRhFYA9Q3/eKIx9za52vtq473oMAdTV/XJ9s4nwHZw21a5s7okwBFCDED3YMWj1+sW2PPi/XS+sg2ThE4C3qjLiXXpCz+1u6cm+gQAKKDcMprgNg2vN0l4TAgT2tU9MRB2H/mcf0T8s/nuv0OpCgIDW/WIMXd5Cl/9w+etOwTOhWk8cnhLowa5BgI6Ah2UK0+qZkAiw30LDd0Tc6RYrIWoMhEAA7nn0jwpK/9Hx7V7B8SBAYOr/1R0HQTli7oXlnmsXgCsNeeheQ0SOuiXgXtu1KQStYd0COJ58i37PMfFdtWD0jw/rFmBjH1s7jZNHZQgwPppdud7G63+c3OwUG12BAGNp+tKPFRchOHbW90X1XFGlArDdlYce2r7jZ9Up1TsCAUb9/n9QaSH4AsLV8mNR2x2kUoB6mzDdPzjYtGOrTQIqBbhSeYywCxR3K/tEKkcF9AnQ7oktO4i5QLFtHjS7wgpbw/oEWNtHvAXyueyRKJwlqkyArkv3euj7DyL33aLG/eSUCbBTx9BvcNmqIQMMExG61sTrP7hcbRTVbS6tSYB6G6//oFNrQYChvPyZiCrY6irwVJoCAYYAiwjd6qD+CTp3ukWjqjNUTQmkesJJxKogAwH8Z7uO0NJBVVUzQI0A6P7Xws1OUSCAv3Sx6l0VnR4E8DerogNUFfstgQB+Um4iBWjix8aOlqmhOgR46P6AqFLEnqxp2T5RgQA9F/WPPnpKFmwrEKCKxY8KaXaRAXyi0UU46aPWQQbwB650q4gndTxqrUEAX5BteYB4UodNOxAARBp5/gUC9F3/oAtILx1HwbMLuADS6jEiSSltDc8u6CWQircIeMOzo+CPBwddgB42wFWLivI16AK4BhlAKyqeXeAF8BBIagXQ8OyCLoARNILVtgFMGwIMim0wDKyVmtmDAIPSMjYiSS1oAwAAAQCAAH2DRjCIsABZnsRDAhEWIAYBtJLlHAQYlDjHEElKycWmIcDAAqCVrpaYhndX8AVAI1grCYsxG3RQknEEklbiMcKKsEFJJxBIWkklCBlgUDIJlEBaySYYGWDgt0gSgaSVTBIZYGAYI8FqUdF/oWBfoBwtIJj0tYAp/fTxQYBB+UXqFOJJHefSH6qYx6VAgIkkqiB9TKUZ6wH8YToLAfQxkcYBGT6RRUeQQjJKBnB0TLXJ0DRCShvIAP7xq9wHCChFfJzNExkI4BuzGTQDNDE7oSa0dHzKbApBpYnJtIVD8nzmlHUBgaWC88llJpwT7LsA01nElpL6hxVtZaBFAJ6bQDNABzMZNfWPIgHEYjqbWEZ4BZyzieV4zCADDIX5HJJA0Dn2rP5BBhhGbsWciOA/I22VqiYBYkwXM6iCgsvF9LK6XTyUfd6FHLZJCS4nZ/Q9HWWfeCJFi9b7CLUAkqMFjTsY6FP2/LEZRFsA+WT+lxo/tj4BptJoCgeR6TRBgBHx2WweARcoPp/LM0OAUYFR4cC9/tX2UKsUgJk+n0MSCAqXZlb07uCqtVdxJssHG2+AsWZjPj2n+QgHrQIw0WfzFxF/Y+fC7ILqDbwtrfHPNJXh80kUQuPkXGJ5Rnl7TKkA8jQJ/GIWQThO3ptXf3yD7pkF2SR/OokkMB4+mVhO6T+9Qf3UmqVZtIbHw+k5KwSH2KoXgIl+t/gRwnHE/GFxRde8/9AKQETZJOVzKIRGx6eT+UySQhD9IRGAiE7OWNg9bjTkeGFpNjwj8aGZXi+/WzqL6BwBn534ZZgmooRnfUkiTr89hkJouHw+txKycztDtMBKeCbLn0zAgWGxnMvPToTtokK2wpBPzfK5BBzwn7OJ/NJ0CNejhumShEiY+ewi41gxf5nj0+cWmVgodGcWhs9pYaZLJ08jan1k5cQiM4Wj4z/0AhARpeLWlydXELi+8OWJf0rG+SDHogRSkgfS8aejlWAgfr+4kk5IKEM/3AIQEWWS9PsFNIgHiv7QH9AW8n2msilGLdQff4hA9IdfACJCLdQHfzy5konG8czhF4CJM0n+0xIceFf+tLSSinOI6/6XwmN1dTUiz9Xx6N6O+9C9ihB/E6esCxdPTCRiEbrk6Ow1y4kYXTgR/zCF/aVfz4fp/MdL0Yr+SAkgRGQxnVmw/nkGXUOvcmk2f+Y4W9HbcCxyu40z8UKOv1hAk+AnvljMz09GdLO9CLUBXkkHYuhhxdzulCJe9rx3jGMRPnQhopfORJZF7x+3LkV4n93PZlfOHI909Ec3A7yI49GPZbnbK0bnks+nlt+bs1Jxlmj0dSIDHEYiJmcX+d/mo9Iq+Nf5/NmFWDJOQgZPHxngJTaqUrJDmwqWJ1dOzjCz4EFDgNc0jJksIfEMre2ZG+1QNY4/yuRPzXEc+R4CHO7A8xVPPY8el+WO/obBhVT+9Bwn43SwnCUqcxwggA+4hjb25YeWSg0+zuZPzliJGCHiIcBAt8jxpNyQW/X7baoF/+PGKf2bqYvHJjgRJ8ILHwL4VRSJsN01O3W60w1oQvhVMr84zRMpsRhnqEGAIdZFbHekXJe7TiBMOJdYPj5l5VIUj+HhQIAR5QQmEs9Qoyu7ttzpjqHL6EJq+ViOcymKWfxKsgIQYNQ4HrW6tNc0jztPbNoZxp/I0PSZ9AdzE5xNUQIvewgQwJv5tMFphNo9avek7VDXlYbTfmJuH/V3LVrvzyZm0nFKJyiT5HSSYvzqHwIQINAmvFI7uYZdTzzDRkiEXPPsZ+IWM4vFFLMobvFBKf+aX4LA9504bsFw2gmvsSJuUfylJSdv+vcbfwmi33cwOA4gAAAQAAAIAAAEAAACAAABAIAAAEAAACAAAGFD41SIF2bEMJMQkTBR16W2Qz1Heh55Rozw88k2YIB7zbEYsVA8Rqk4JWKUTVrJuMjBU2AhOVgypHE+tkYBhIi6rjQ6ZHfMo/awph+Dw5nj00vphakMT6Qo9WzRvULDgz0b9KXDCZs92m+au40HKtbmRo0MTV/IfTCTZV0HKwVTgOfJlI2RWkf2m3Ir2rvY6uLD9PLcBE9l2GJmkiBXosEsgZiEqm0p2+ZOD3Gvj1udEnWIiC6kludzPJUhJiuYs7kDJ0DPo926XGkUEUYh4Ha3RF0iok9z+eOTT/fnQgn0Broure/LrQ5CP7R8lMkvzQRLg0AI0HHpcVnuOQj9SHAuufzeMU7FGQKQ49H6vtxoI/Qjx6+zy0szsURMnrX6yIylI3VsAniGtuumZKONG2lWpvLHpzg2vmQwHgFqbfm2fNN92lMAok2OFn8zf3o6M56/PvK5QEIPy/J1uYjoB0+xafvrcuFRRURo9FXQyDIAE0m9TV+VC3jk4E18sbAykRrp7kejywDr+4h+8Bb+tlPYqI50DuMIBGDP0Pfre1caiH7wdkp28dp60xvV+X1DLYGYSDoOXd5C6IMj8+WJlXRi6OXQUDOAVFuIftAnl7cKtY452IxeoQBbNfmmgugH/fP1bnHHHm4xNCwBnuxLoY7xXTAo/1stblSNMgHW9uQqpnMC/5rFa3uiRQBe25NrTUQ/8JNrzeLG/k/LpAIqgBCtVxH9YDh5oFFcr3pC4m+/kD8CMDERb9fkio1WLxgWV+xS2SZ/k4A/AgiZasug1QuGzXfVYrUlPm7B4o8AHYe/qSD6wSj4plLsOORXIeSDAJ5gtAuMlMtbBc8EIgMIEd3ZdPBIwIh5sOsFQQDerMlD7xqeBxgx93qlzaqMWYBGR4po+IIxUbSLbWfQ1nD/AgjRf+0i+sE4+ctWccCRgf4FeFwxeABg7DyuDDRC3KcAdoeut7ChAxg/11vFzrNCSEYkgBH6+y76PUFQ+MfWfSMyugywW8fBEyBAtKm2Y8uIMoBr6Hv0/ICAUagV3b4GBo4kABPx4wpe/yCIbNakj6bwkQQQx8PuzSCgXGsWHY+OWggdrQR6vIeuTxBc1ioyxAzQceQ2zikCAeZWt+gecUehIwiwWcUdBkFnvTqcEsj16CaqfxB4rrdKjhmCAJUGOn+ADir2EVoC7yoA+v6BFm7W7797X9A7CdDo4q4CNbSp1uj6KkDZRv0DNPHuEft2AUQIh9gBXdxol+TdDqh/uwA2jjICCml02B8Bhr09LwDDYL9t/BHgThejv0AfPzRLPgjQc3EngVa67sACVFuof4BWai0ZVIDdhof7CJSy23AHEoCJsekV0MtB9HKfAvQMxr+AbjxDh0+LsAYsoQAIMs3eAAI0OhAA6Kb17KDVvgToYNdnoJz628aDDxPgvoshMKCbe06x7xII9Q8IB32VQDLMQ+QBCLoAjosMAMJAz+urBOpCABAKOocukj9EANw6EAYct68SyMUkIBAOAbzDmgFvFMDDNFAQCjxz2M7p6OoBoaffkWAAQg8EABAAAAgAAAQAAAIAEBn+H/Hv+XmfWBrVAAAAAElFTkSuQmCC";

// src/net/fetchUtil.ts
var TIMEOUT = 15e3;
function checkResponse(code) {
  if (code >= 400 && code < 600) {
    throw new Error(code.toString());
  }
}
function fetchWithTimeout(_0, _1) {
  return __async(this, arguments, function* (url, options, timeout = TIMEOUT) {
    return Promise.race([
      fetch(url, options).catch((err) => {
        throw new Error(url + " failed");
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error(url + " timeout")), TIMEOUT))
    ]);
  });
}

// src/net/getAccountStatus.ts
function getAccountStatus(node, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/status?agent=${token}`;
    const status = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(status.status);
    return yield status.json();
  });
}

// src/net/addAccountMFAuth.ts
function addAccountMFAuth(node, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/mfauth?agent=${token}`;
    const auth = yield fetchWithTimeout(endpoint, { method: "POST" });
    checkResponse(auth.status);
    return yield auth.json();
  });
}

// src/net/setAccountMFAuth.ts
function setAccountMFAuth(node, secure, token, code) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/mfauth?agent=${token}&code=${code}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "PUT" });
    checkResponse(status);
  });
}

// src/net/removeAccountMFAuth.ts
function removeAccountMFAuth(node, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/mfauth?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(status);
  });
}

// src/net/base64.ts
function encode(input) {
  let output = "";
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;
  const _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  input = _utf8_encode(input);
  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = (chr1 & 3) << 4 | chr2 >> 4;
    enc3 = (chr2 & 15) << 2 | chr3 >> 6;
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
  }
  return output;
}
function _utf8_encode(value) {
  value = value.replace(/\r\n/g, "\n");
  let utftext = "";
  for (let n = 0; n < value.length; n++) {
    let c = value.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if (c > 127 && c < 2048) {
      utftext += String.fromCharCode(c >> 6 | 192);
      utftext += String.fromCharCode(c & 63 | 128);
    } else {
      utftext += String.fromCharCode(c >> 12 | 224);
      utftext += String.fromCharCode(c >> 6 & 63 | 128);
      utftext += String.fromCharCode(c & 63 | 128);
    }
  }
  return utftext;
}

// src/net/setAccountLogin.ts
function setAccountLogin(node, secure, token, username, password) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/login?agent=${token}`;
    const auth = encode(`${username}:${password}`);
    const headers = new Headers();
    headers.append("Authorization", `Basic ${auth}`);
    const { status } = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      headers
    });
    checkResponse(status);
  });
}

// src/net/setAccountNotifications.ts
function setAccountNotifications(node, secure, token, flag, pushParams) {
  return __async(this, null, function* () {
    const pushEndpoint = pushParams ? encodeURIComponent(pushParams.endpoint) : "";
    const publicKey = pushParams ? encodeURIComponent(pushParams.publicKey) : "";
    const auth = pushParams ? encodeURIComponent(pushParams.auth) : "";
    const params = pushParams ? `&webEndpoint=${pushEndpoint}&webPublicKey=${publicKey}&webAuth=${auth}&pushType=${pushParams.type}` : "";
    const endpoint = `http${secure ? "s" : ""}://${node}/account/notification?agent=${token}${params}`;
    const { status } = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      body: JSON.stringify(flag)
    });
    checkResponse(status);
  });
}

// src/net/setAccountSearchable.ts
function setAccountSearchable(node, secure, token, flag) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/searchable?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      body: JSON.stringify(flag)
    });
    checkResponse(status);
  });
}

// src/net/setAccountSeal.ts
function setAccountSeal(node, secure, token, seal) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/seal?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      body: JSON.stringify(seal)
    });
    checkResponse(status);
  });
}

// src/net/getUsername.ts
function getUsername(name, token, agent, node, secure) {
  return __async(this, null, function* () {
    const param = token ? `&token=${token}` : agent ? `&agent=${agent}` : "";
    const username = encodeURIComponent(name);
    const endpoint = `http${secure ? "s" : ""}://${node}/account/username?name=${username}${param}`;
    const taken = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(taken.status);
    return yield taken.json();
  });
}

// src/settings.ts
var CLOSE_POLL_MS = 100;
var RETRY_POLL_MS = 2e3;
var SettingsModule = class {
  constructor(log, store, crypto, guid, token, node, secure) {
    this.log = log;
    this.store = store;
    this.crypto = crypto;
    this.emitter = new EventEmitter();
    this.guid = guid;
    this.token = token;
    this.node = node;
    this.seal = null;
    this.secure = secure;
    this.revision = 0;
    this.config = defaultConfigEntity;
    this.syncing = true;
    this.closing = false;
    this.nextRevision = null;
    this.init();
  }
  getSeal() {
    var _a, _b;
    if (((_a = this.seal) == null ? void 0 : _a.publicKey) && ((_b = this.config.seal) == null ? void 0 : _b.publicKey)) {
      return this.seal;
    }
    return null;
  }
  init() {
    return __async(this, null, function* () {
      this.revision = yield this.store.getSettingsRevision(this.guid);
      this.config = yield this.store.getSettingsData(this.guid);
      this.seal = yield this.store.getSeal(this.guid);
      this.emitter.emit("seal", this.getSeal());
      this.emitter.emit("config", this.getConfig());
      this.syncing = false;
      yield this.sync();
    });
  }
  sync() {
    return __async(this, null, function* () {
      if (!this.syncing) {
        this.syncing = true;
        while (this.nextRevision && !this.closing) {
          if (this.revision == this.nextRevision) {
            this.nextRevision = null;
          } else {
            const nextRev = this.nextRevision;
            try {
              const { guid, node, secure, token } = this;
              const config = yield getAccountStatus(node, secure, token);
              yield this.store.setSettingsData(guid, config);
              yield this.store.setSettingsRevision(guid, nextRev);
              this.config = config;
              this.emitter.emit("config", this.getConfig());
              this.emitter.emit("seal", this.getSeal());
              this.revision = nextRev;
              if (this.nextRevision === nextRev) {
                this.nextRevision = null;
              }
              this.log.info(`account revision: ${nextRev}`);
            } catch (err) {
              this.log.warn(err);
              yield new Promise((r) => setTimeout(r, RETRY_POLL_MS));
            }
          }
        }
        this.syncing = false;
      }
    });
  }
  getConfig() {
    var _a, _b;
    const { storageUsed, storageAvailable, forwardingAddress, searchable, allowUnsealed, pushEnabled, sealable, seal, enableIce, mfaEnabled, webPushKey } = this.config;
    const { passwordSalt, privateKeyIv, privateKeyEncrypted, publicKey } = seal || {};
    const sealSet = Boolean(passwordSalt && privateKeyIv && privateKeyEncrypted && publicKey);
    const sealUnlocked = Boolean(sealSet && ((_a = this.seal) == null ? void 0 : _a.privateKey) && ((_b = this.seal) == null ? void 0 : _b.publicKey) == publicKey);
    return {
      storageUsed,
      storageAvailable,
      forwardingAddress,
      searchable,
      allowUnsealed,
      pushEnabled,
      sealable,
      sealSet,
      sealUnlocked,
      enableIce,
      mfaEnabled,
      webPushKey
    };
  }
  addConfigListener(ev) {
    this.emitter.on("config", ev);
    this.emitter.emit("config", this.getConfig());
  }
  removeConfigListener(ev) {
    this.emitter.off("config", ev);
  }
  addSealListener(ev) {
    this.emitter.on("seal", ev);
    ev(this.seal);
  }
  removeSealListener(ev) {
    this.emitter.off("seal", ev);
  }
  close() {
    return __async(this, null, function* () {
      this.closing = true;
      while (this.syncing) {
        yield new Promise((r) => setTimeout(r, CLOSE_POLL_MS));
      }
    });
  }
  setRevision(rev) {
    return __async(this, null, function* () {
      this.nextRevision = rev;
      yield this.sync();
    });
  }
  enableNotifications(params) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setAccountNotifications(node, secure, token, true, params);
    });
  }
  disableNotifications() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setAccountNotifications(node, secure, token, false);
    });
  }
  enableRegistry() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setAccountSearchable(node, secure, token, true);
    });
  }
  disableRegistry() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setAccountSearchable(node, secure, token, false);
    });
  }
  enableMFA() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const { secretImage, secretText } = yield addAccountMFAuth(node, secure, token);
      return { secretImage, secretText };
    });
  }
  disableMFA() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield removeAccountMFAuth(node, secure, token);
    });
  }
  confirmMFA(code) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setAccountMFAuth(node, secure, token, code);
    });
  }
  setSeal(password) {
    return __async(this, null, function* () {
      const { crypto, guid, node, secure, token } = this;
      if (!crypto) {
        throw new Error("crypto not enabled");
      }
      const { saltHex } = yield crypto.pbkdfSalt();
      const { aesKeyHex } = yield crypto.pbkdfKey(saltHex, password);
      const { publicKeyB64, privateKeyB64 } = yield crypto.rsaKey();
      const { ivHex } = yield crypto.aesIv();
      const { encryptedDataB64 } = yield crypto.aesEncrypt(privateKeyB64, ivHex, aesKeyHex);
      const seal = {
        passwordSalt: saltHex,
        privateKeyIv: ivHex,
        privateKeyEncrypted: encryptedDataB64,
        publicKey: publicKeyB64
      };
      yield setAccountSeal(node, secure, token, seal);
      this.seal = { publicKey: publicKeyB64, privateKey: privateKeyB64 };
      this.store.setSeal(guid, this.seal);
      this.emitter.emit("config", this.getConfig());
      this.emitter.emit("seal", this.getSeal());
    });
  }
  updateSeal(password) {
    return __async(this, null, function* () {
      const { crypto, config, node, secure, token } = this;
      if (!crypto) {
        throw new Error("crypto not enabled");
      }
      if (!this.seal || this.seal.publicKey !== config.seal.publicKey) {
        throw new Error("seal not unlocked");
      }
      const { saltHex } = yield crypto.pbkdfSalt();
      const { aesKeyHex } = yield crypto.pbkdfKey(saltHex, password);
      const { ivHex } = yield crypto.aesIv();
      const { encryptedDataB64 } = yield crypto.aesEncrypt(this.seal.privateKey, ivHex, aesKeyHex);
      const seal = {
        passwordSalt: saltHex,
        privateKeyIv: ivHex,
        privateKeyEncrypted: encryptedDataB64,
        publicKey: config.seal.publicKey
      };
      yield setAccountSeal(node, secure, token, seal);
    });
  }
  clearSeal() {
    return __async(this, null, function* () {
      const { guid, node, secure, token } = this;
      const seal = {
        passwordSalt: "",
        privateKeyIv: "",
        privateKeyEncrypted: "",
        publicKey: ""
      };
      yield setAccountSeal(node, secure, token, seal);
      yield this.store.clearSeal(guid);
      this.seal = null;
      this.emitter.emit("config", this.getConfig());
      this.emitter.emit("seal", this.getSeal());
    });
  }
  unlockSeal(password) {
    return __async(this, null, function* () {
      const { guid, config, crypto } = this;
      const { passwordSalt, privateKeyIv, privateKeyEncrypted, publicKey } = config.seal;
      if (!passwordSalt || !privateKeyIv || !privateKeyEncrypted || !publicKey) {
        throw new Error("account seal not set");
      }
      if (!crypto) {
        throw new Error("crypto not set");
      }
      const { aesKeyHex } = yield crypto.pbkdfKey(passwordSalt, password);
      const { data } = yield crypto.aesDecrypt(privateKeyEncrypted, privateKeyIv, aesKeyHex);
      const seal = { publicKey, privateKey: data };
      this.store.setSeal(guid, seal);
      this.seal = seal;
      this.emitter.emit("config", this.getConfig());
      this.emitter.emit("seal", this.getSeal());
    });
  }
  forgetSeal() {
    return __async(this, null, function* () {
      const { guid } = this;
      yield this.store.clearSeal(guid);
      this.seal = null;
      this.emitter.emit("config", this.getConfig());
      this.emitter.emit("seal", this.getSeal());
    });
  }
  getUsernameStatus(username) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      return yield getUsername(username, null, token, node, secure);
    });
  }
  setLogin(username, password) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setAccountLogin(node, secure, token, username, password);
    });
  }
  getBlockedCards() {
    return __async(this, null, function* () {
      const { guid } = this;
      const blockedContacts = yield this.store.getMarkers(guid, "blocked_card");
      return blockedContacts.map((marker) => {
        try {
          return JSON.parse(marker.value);
        } catch (err) {
          return {};
        }
      });
    });
  }
  getBlockedChannels() {
    return __async(this, null, function* () {
      const { guid } = this;
      const blockedChannels = yield this.store.getMarkers(guid, "blocked_channel");
      const blockedCardChannels = yield this.store.getMarkers(guid, "blocked_card_channel");
      return blockedChannels.concat(blockedCardChannels).map((marker) => {
        try {
          return JSON.parse(marker.value);
        } catch (err) {
          return {};
        }
      });
    });
  }
  getBlockedTopics() {
    return __async(this, null, function* () {
      const { guid } = this;
      const blockedTopics = yield this.store.getMarkers(guid, "blocked_topic");
      return blockedTopics.map((marker) => {
        try {
          return JSON.parse(marker.value);
        } catch (err) {
          return {};
        }
      });
    });
  }
};

// src/identity.ts
import { EventEmitter as EventEmitter2 } from "eventemitter3";

// src/net/getProfile.ts
function getProfile(node, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/profile?agent=${token}`;
    const profile = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(profile.status);
    return yield profile.json();
  });
}

// src/net/setProfileData.ts
function setProfileData(node, secure, token, name, location, description) {
  return __async(this, null, function* () {
    const data = { name, location, description };
    const endpoint = `http${secure ? "s" : ""}://${node}/profile/data?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "PUT", body: JSON.stringify(data) });
    checkResponse(status);
  });
}

// src/net/setProfileImage.ts
function setProfileImage(node, secure, token, image) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/profile/image?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      body: JSON.stringify(image)
    });
    checkResponse(status);
  });
}

// src/identity.ts
var CLOSE_POLL_MS2 = 100;
var RETRY_POLL_MS2 = 2e3;
var IdentityModule = class {
  constructor(log, store, guid, token, node, secure) {
    this.imageUrl = avatar;
    this.guid = guid;
    this.token = token;
    this.node = node;
    this.secure = secure;
    this.store = store;
    this.log = log;
    this.emitter = new EventEmitter2();
    this.revision = 0;
    this.profile = defaultProfileEntity;
    this.syncing = true;
    this.closing = false;
    this.nextRevision = null;
    this.init();
  }
  init() {
    return __async(this, null, function* () {
      this.revision = yield this.store.getProfileRevision(this.guid);
      this.profile = yield this.store.getProfileData(this.guid);
      if (this.profile.image) {
        this.imageUrl = `data:image/png;base64,${this.profile.image}`;
      } else {
        this.imageUrl = avatar;
      }
      this.emitter.emit("profile", this.setProfile());
      this.syncing = false;
      yield this.sync();
    });
  }
  sync() {
    return __async(this, null, function* () {
      if (!this.syncing) {
        this.syncing = true;
        while (this.nextRevision && !this.closing) {
          if (this.revision == this.nextRevision) {
            this.nextRevision = null;
          } else {
            const nextRev = this.nextRevision;
            try {
              const { guid, node, secure, token } = this;
              const profile = yield getProfile(node, secure, token);
              yield this.store.setProfileData(guid, profile);
              yield this.store.setProfileRevision(guid, nextRev);
              this.profile = profile;
              if (profile.image) {
                this.imageUrl = `data:image/png;base64,${profile.image}`;
              } else {
                this.imageUrl = avatar;
              }
              this.emitter.emit("profile", this.setProfile());
              this.revision = nextRev;
              if (this.nextRevision === nextRev) {
                this.nextRevision = null;
              }
              this.log.info(`identity revision: ${nextRev}`);
            } catch (err) {
              this.log.warn(err);
              yield new Promise((r) => setTimeout(r, RETRY_POLL_MS2));
            }
          }
        }
        this.syncing = false;
      }
    });
  }
  setProfile() {
    const { guid, handle, name, description, location, image, revision, seal, version, node } = this.profile;
    return {
      guid,
      handle,
      name,
      description,
      location,
      imageSet: Boolean(image),
      imageUrl: this.imageUrl,
      version,
      node,
      sealSet: Boolean(seal)
    };
  }
  addProfileListener(ev) {
    this.emitter.on("profile", ev);
    this.emitter.emit("profile", this.setProfile());
  }
  removeProfileListener(ev) {
    this.emitter.off("profile", ev);
  }
  close() {
    return __async(this, null, function* () {
      this.closing = true;
      while (this.syncing) {
        yield new Promise((r) => setTimeout(r, CLOSE_POLL_MS2));
      }
    });
  }
  setRevision(rev) {
    return __async(this, null, function* () {
      this.nextRevision = rev;
      yield this.sync();
    });
  }
  setProfileData(name, location, description) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setProfileData(node, secure, token, name, location, description);
    });
  }
  setProfileImage(image) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setProfileImage(node, secure, token, image);
    });
  }
  getProfileImageUrl() {
    return this.imageUrl;
  }
};

// src/contact.ts
import { EventEmitter as EventEmitter4 } from "eventemitter3";

// src/focus.ts
import { EventEmitter as EventEmitter3 } from "eventemitter3";

// src/types.ts
var HostingMode = /* @__PURE__ */ ((HostingMode2) => {
  HostingMode2["Inline"] = "inline";
  HostingMode2["Split"] = "split";
  HostingMode2["Basic"] = "basic";
  return HostingMode2;
})(HostingMode || {});
var TransformType = /* @__PURE__ */ ((TransformType2) => {
  TransformType2["Copy"] = "copy";
  TransformType2["Thumb"] = "thumb";
  TransformType2["HighQuality"] = "high";
  TransformType2["LowQuality"] = "low";
  return TransformType2;
})(TransformType || {});
var AssetType = /* @__PURE__ */ ((AssetType2) => {
  AssetType2["Image"] = "image";
  AssetType2["Video"] = "video";
  AssetType2["Audio"] = "audio";
  AssetType2["Binary"] = "binary";
  return AssetType2;
})(AssetType || {});
var KeyType = /* @__PURE__ */ ((KeyType2) => {
  KeyType2["RSA_4096"] = "RSA4096";
  KeyType2["RSA_2048"] = "RSA2048";
  return KeyType2;
})(KeyType || {});
var ICEService = /* @__PURE__ */ ((ICEService2) => {
  ICEService2["Cloudflare"] = "cloudflare";
  ICEService2["Default"] = "default";
  return ICEService2;
})(ICEService || {});
var PushType = /* @__PURE__ */ ((PushType2) => {
  PushType2["UPN"] = "upn";
  PushType2["Web"] = "web";
  PushType2["FCM"] = "fcm";
  return PushType2;
})(PushType || {});

// src/items.ts
var defaultCardItem = {
  revision: 0,
  profile: {
    revision: 0,
    handle: "",
    guid: "",
    name: "",
    description: "",
    location: "",
    imageSet: false,
    node: "",
    version: "",
    seal: ""
  },
  detail: {
    revision: 0,
    status: "",
    statusUpdated: 0,
    token: ""
  },
  profileRevision: 0,
  articleRevision: 0,
  channelRevision: 0
};
var defaultChannelItem = {
  summary: {
    revision: 0,
    sealed: false,
    guid: "",
    dataType: "",
    data: "",
    created: 0,
    updated: 0,
    status: "",
    transform: ""
  },
  detail: {
    revision: 0,
    sealed: false,
    dataType: "",
    data: "",
    created: 0,
    updated: 0,
    enableImage: false,
    enableAudio: false,
    enableVideo: false,
    enableBinary: false,
    contacts: {
      groups: [],
      cards: []
    },
    members: []
  },
  channelKey: null,
  unsealedDetail: null,
  unsealedSummary: null
};
var defaultTopicItem = {
  detail: {
    revision: 0,
    guid: "",
    sealed: false,
    dataType: "",
    data: null,
    created: 0,
    updated: 0,
    status: "",
    transform: ""
  },
  unsealedDetail: null,
  position: 0
};

// src/net/getChannelTopics.ts
function getChannelTopics(node, secure, token, channelId, revision, count, begin, end) {
  return __async(this, null, function* () {
    const params = (revision ? `&revision=${revision}` : "") + (count ? `&count=${count}` : "") + (begin ? `&begin=${begin}` : "") + (end ? `&end=${end}` : "");
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics?agent=${token}${params}`;
    const topics = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(topics.status);
    return {
      marker: parseInt(topics.headers.get("topic-marker") || "0"),
      revision: parseInt(topics.headers.get("topic-revision") || "0"),
      topics: yield topics.json()
    };
  });
}

// src/net/getChannelTopicDetail.ts
function getChannelTopicDetail(node, secure, token, channelId, topicId) {
  return __async(this, null, function* () {
    var _a;
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/detail?agent=${token}`;
    const detail = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(detail.status);
    const topic = yield detail.json();
    if (!((_a = topic == null ? void 0 : topic.data) == null ? void 0 : _a.topicDetail)) {
      throw new Error("missing topic detail");
    } else {
      return topic.data.topicDetail;
    }
  });
}

// src/net/getContactChannelTopics.ts
function getContactChannelTopics(node, secure, guidToken, channelId, revision, count, begin, end) {
  return __async(this, null, function* () {
    const params = (revision ? `&revision=${revision}` : "") + (count ? `&count=${count}` : "") + (begin ? `&begin=${begin}` : "") + (end ? `&end=${end}` : "");
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics?contact=${guidToken}${params}`;
    const topics = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(topics.status);
    return {
      marker: parseInt(topics.headers.get("topic-marker") || "0"),
      revision: parseInt(topics.headers.get("topic-revision") || "0"),
      topics: yield topics.json()
    };
  });
}

// src/net/getContactChannelTopicDetail.ts
function getContactChannelTopicDetail(node, secure, guidToken, channelId, topicId) {
  return __async(this, null, function* () {
    var _a;
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/detail?contact=${guidToken}`;
    const detail = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(detail.status);
    const topic = yield detail.json();
    if (!((_a = topic == null ? void 0 : topic.data) == null ? void 0 : _a.topicDetail)) {
      throw new Error("missing topic detail");
    } else {
      return topic.data.topicDetail;
    }
  });
}

// src/net/addChannelTopic.ts
function addChannelTopic(node, secure, token, channelId, dataType, data, confirm) {
  return __async(this, null, function* () {
    const subject = { data: JSON.stringify(data), dataType };
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics?agent=${token}&confirm=${confirm}`;
    const response = yield fetchWithTimeout(endpoint, { method: "POST", body: JSON.stringify(subject) });
    checkResponse(response.status);
    const topic = yield response.json();
    return topic.id;
  });
}

// src/net/addContactChannelTopic.ts
function addContactChannelTopic(node, secure, guidToken, channelId, dataType, data, confirm) {
  return __async(this, null, function* () {
    const subject = { data: JSON.stringify(data), dataType };
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics?contact=${guidToken}&confirm=${confirm}`;
    const response = yield fetchWithTimeout(endpoint, { method: "POST", body: JSON.stringify(subject) });
    checkResponse(response.status);
    const topic = yield response.json();
    return topic.id;
  });
}

// src/net/setChannelTopicSubject.ts
function setChannelTopicSubject(node, secure, token, channelId, topicId, dataType, data) {
  return __async(this, null, function* () {
    const subject = { data: JSON.stringify(data), dataType };
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/subject?agent=${token}&confirm=true`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "PUT", body: JSON.stringify(subject) });
    checkResponse(status);
  });
}

// src/net/setContactChannelTopicSubject.ts
function setContactChannelTopicSubject(node, secure, guidToken, channelId, topicId, dataType, data) {
  return __async(this, null, function* () {
    const subject = { data: JSON.stringify(data), dataType };
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/subject?contact=${guidToken}&confirm=true`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "PUT", body: JSON.stringify(subject) });
    checkResponse(status);
  });
}

// src/net/setChannelTopicRead.ts
function setChannelTopicRead(node, secure, token, channelId, topicId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/read?agent=${token}`;
    const response = yield fetchWithTimeout(endpoint, { method: "PUT", body: "" });
    checkResponse(response.status);
  });
}
function getChannelTopicReads(node, secure, token, channelId, topicId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/reads?agent=${token}`;
    const response = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(response.status);
    const result = yield response.json();
    return result.readBy || [];
  });
}
function setContactChannelTopicRead(node, secure, token, channelId, topicId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/read?contact=${token}`;
    const response = yield fetchWithTimeout(endpoint, { method: "PUT", body: "" });
    checkResponse(response.status);
  });
}
function getContactChannelTopicReads(node, secure, token, channelId, topicId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/reads?contact=${token}`;
    const response = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(response.status);
    const result = yield response.json();
    return result.readBy || [];
  });
}

// src/legacy.ts
function getLegacyData(data) {
  if (data == null) {
    return { data: null, assets: [] };
  }
  const { text, textColor, textSize, assets } = data;
  let index = 0;
  const assetItems = /* @__PURE__ */ new Set();
  const dataAssets = !assets ? [] : assets.map(({ encrypted, image, audio, video, binary }) => {
    if (encrypted) {
      const { type, thumb, label, extension, parts } = encrypted;
      if (thumb) {
        const asset2 = {
          assetId: `${index}`,
          hosting: "inline" /* Inline */,
          inline: thumb
        };
        assetItems.add(asset2);
        index += 1;
      }
      const asset = {
        assetId: `${index}`,
        hosting: "split" /* Split */,
        split: parts
      };
      assetItems.add(asset);
      index += 1;
      if (thumb) {
        return { encrypted: { type, thumb: `${index - 2}`, parts: `${index - 1}`, label, extension } };
      } else {
        return { encrypted: { type, parts: `${index - 1}`, label, extension } };
      }
    } else {
      if (image) {
        const { thumb, full } = image;
        const thumbAsset = {
          assetId: `${index}`,
          hosting: "basic" /* Basic */,
          basic: thumb
        };
        assetItems.add(thumbAsset);
        index += 1;
        const fullAsset = {
          assetId: `${index}`,
          hosting: "basic" /* Basic */,
          basic: full
        };
        assetItems.add(fullAsset);
        index += 1;
        return { image: { thumb: `${index - 2}`, full: `${index - 1}` } };
      } else if (video) {
        const { thumb, hd, lq } = video;
        const thumbAsset = {
          assetId: `${index}`,
          hosting: "basic" /* Basic */,
          basic: thumb
        };
        assetItems.add(thumbAsset);
        index += 1;
        const hdAsset = {
          assetId: `${index}`,
          hosting: "basic" /* Basic */,
          basic: hd
        };
        assetItems.add(hdAsset);
        index += 1;
        const lqAsset = {
          assetId: `${index}`,
          hosting: "basic" /* Basic */,
          basic: lq
        };
        assetItems.add(lqAsset);
        index += 1;
        return { video: { thumb: `${index - 3}`, hd: `${index - 2}`, lq: `${index - 1}` } };
      } else if (audio) {
        const { label, full } = audio;
        const fullAsset = {
          assetId: `${index}`,
          hosting: "basic" /* Basic */,
          basic: full
        };
        assetItems.add(fullAsset);
        index += 1;
        return { audio: { label, full: `${index - 1}` } };
      } else if (binary) {
        const { label, extension, data: data2 } = binary;
        const dataAsset = {
          assetId: `${index}`,
          hosting: "basic" /* Basic */,
          basic: data2
        };
        assetItems.add(dataAsset);
        index += 1;
        return { binary: { label, extension, data: `${index - 1}` } };
      } else {
        return {};
      }
    }
  });
  return { data: { text, textColor, textSize, assets: dataAssets }, assets: Array.from(assetItems.values()) };
}

// src/focus.ts
var BATCH_COUNT = 32;
var MIN_LOAD_SIZE = BATCH_COUNT / 2;
var CLOSE_POLL_MS3 = 100;
var RETRY_POLL_MS3 = 2e3;
var ENCRYPT_BLOCK_SIZE = 1048576;
var _FocusModule = class _FocusModule {
  constructor(log, store, crypto, staging, cardId, channelId, guid, connection, channelKey, sealEnabled, revision, markRead, flagChannelTopic) {
    this.cardId = cardId;
    this.channelId = channelId;
    this.log = log;
    this.emitter = new EventEmitter3();
    this.store = store;
    this.crypto = crypto;
    this.staging = staging;
    this.guid = guid;
    this.connection = connection;
    this.channelKey = channelKey;
    this.sealEnabled = sealEnabled;
    this.markRead = markRead;
    this.flagChannelTopic = flagChannelTopic;
    this.loaded = false;
    this.justAdded = false;
    this.offsync = false;
    this.topicEntries = /* @__PURE__ */ new Map();
    this.blocked = /* @__PURE__ */ new Set();
    this.cacheView = null;
    this.storeView = { revision: null, marker: null };
    this.syncing = true;
    this.closing = false;
    this.closeStaging = [];
    this.nextRevision = null;
    this.focusDetail = null;
    this.loadMore = false;
    this.unsealAll = false;
    this.localComplete = false;
    this.remoteComplete = false;
    this.init(revision);
  }
  init(revision) {
    return __async(this, null, function* () {
      const { guid } = this;
      this.nextRevision = revision;
      this.storeView = yield this.getChannelTopicRevision();
      this.localComplete = this.storeView.revision == null;
      const blockedMarkers = yield this.store.getMarkers(guid, "blocked_topic");
      blockedMarkers.forEach((marker) => {
        this.blocked.add(marker.id);
      });
      this.unsealAll = true;
      this.loadMore = true;
      this.syncing = false;
      yield this.sync();
    });
  }
  sync() {
    return __async(this, null, function* () {
      if (!this.syncing) {
        this.syncing = true;
        while ((this.loadMore || this.unsealAll || this.nextRevision || this.justAdded) && !this.closing && this.connection) {
          if (this.loadMore) {
            try {
              if (!this.localComplete) {
                const topics = yield this.getLocalChannelTopics(this.cacheView);
                for (const entry of topics) {
                  const { topicId, item } = entry;
                  if (yield this.unsealTopicDetail(item)) {
                    yield this.setLocalChannelTopicUnsealedDetail(topicId, item.unsealedDetail);
                  }
                  const topic = this.setTopic(topicId, item);
                  this.topicEntries.set(topicId, { item, topic });
                  if (!this.cacheView || this.cacheView.position > item.detail.created || this.cacheView.position === item.detail.created && this.cacheView.topicId > topicId) {
                    this.cacheView = { topicId, position: item.detail.created };
                  }
                }
                if (topics.length == 0) {
                  this.localComplete = true;
                }
                if (topics.length > MIN_LOAD_SIZE) {
                  this.loadMore = false;
                }
              } else if (!this.storeView.revision || this.storeView.marker) {
                const delta = yield this.getRemoteChannelTopics(null, null, this.storeView.marker);
                for (const entity of delta.topics) {
                  const { id, revision, data } = entity;
                  if (data) {
                    const { detailRevision, topicDetail } = data;
                    const entry = yield this.getTopicEntry(id);
                    if (detailRevision > entry.item.detail.revision) {
                      const detail = topicDetail ? topicDetail : yield this.getRemoteChannelTopicDetail(id);
                      entry.item.detail = this.getTopicDetail(detail, detailRevision);
                      entry.item.unsealedDetail = null;
                      entry.item.position = detail.created;
                      yield this.unsealTopicDetail(entry.item);
                      entry.topic = this.setTopic(id, entry.item);
                      yield this.setLocalChannelTopicDetail(id, entry.item.detail, entry.item.unsealedDetail, detail.created);
                    }
                  } else {
                    this.log.error("ignoring unexpected delete entry on initial load");
                  }
                }
                if (delta.topics.length === 0) {
                  this.remoteComplete = true;
                }
                const rev = this.storeView.revision ? this.storeView.revision : delta.revision;
                const mark = delta.topics.length ? delta.marker : null;
                this.storeView = { revision: rev, marker: mark };
                yield this.setChannelTopicRevision(this.storeView);
                this.loadMore = false;
              } else {
                this.loadMore = false;
              }
              this.emitTopics();
            } catch (err) {
              if (!this.offsync) {
                this.offsync = true;
                this.emitOffsync();
              }
              this.log.warn(err);
              yield new Promise((r) => setTimeout(r, RETRY_POLL_MS3));
            }
          }
          if (this.justAdded || this.nextRevision && this.storeView.revision !== this.nextRevision) {
            this.justAdded = false;
            const nextRev = this.nextRevision;
            try {
              const delta = yield this.getRemoteChannelTopics(this.storeView.revision, this.storeView.marker, null);
              for (const entity of delta.topics) {
                const { id, revision, data } = entity;
                if (data) {
                  const { detailRevision, topicDetail } = data;
                  const detail = topicDetail ? topicDetail : yield this.getRemoteChannelTopicDetail(id);
                  if (!this.cacheView || this.cacheView.position < detail.created || this.cacheView.position === detail.created && this.cacheView.topicId >= id) {
                    const entry = yield this.getTopicEntry(id);
                    if (detailRevision > entry.item.detail.revision) {
                      entry.item.detail = this.getTopicDetail(detail, detailRevision);
                      entry.item.unsealedDetail = null;
                      entry.item.position = detail.created;
                      yield this.unsealTopicDetail(entry.item);
                      entry.topic = this.setTopic(id, entry.item);
                      yield this.setLocalChannelTopicDetail(id, entry.item.detail, entry.item.unsealedDetail, detail.created);
                    }
                  } else {
                    const itemDetail = this.getTopicDetail(detail, detailRevision);
                    const item = { detail: itemDetail, position: detail.created, unsealedDetail: null };
                    yield this.addLocalChannelTopic(id, item);
                  }
                } else {
                  this.topicEntries.delete(id);
                  yield this.removeLocalChannelTopic(id);
                }
              }
              this.storeView = { revision: delta.revision, marker: this.storeView.marker };
              yield this.setChannelTopicRevision(this.storeView);
              if (this.nextRevision === nextRev) {
                this.nextRevision = null;
              }
              this.emitTopics();
              this.log.info(`topic revision: ${nextRev}`);
            } catch (err) {
              if (!this.offsync) {
                this.offsync = true;
                this.emitOffsync();
              }
              this.log.warn(err);
              yield new Promise((r) => setTimeout(r, RETRY_POLL_MS3));
            }
          }
          if (this.storeView.revision === this.nextRevision) {
            this.nextRevision = null;
          }
          if (this.unsealAll) {
            for (const [topicId, entry] of this.topicEntries.entries()) {
              try {
                const { item } = entry;
                if (yield this.unsealTopicDetail(item)) {
                  yield this.setLocalChannelTopicUnsealedDetail(topicId, item.unsealedDetail);
                  entry.topic = this.setTopic(topicId, item);
                }
              } catch (err) {
                this.log.warn(err);
              }
            }
            this.unsealAll = false;
            this.emitTopics();
          }
        }
        if (this.offsync) {
          this.offsync = false;
          this.emitOffsync();
        }
        this.syncing = false;
        yield this.markRead();
      }
    });
  }
  downloadBlock(topicId, blockId, progress) {
    const { cardId, channelId, connection } = this;
    if (!connection) {
      throw new Error("disconnected from channel");
    }
    const { node, secure, token } = connection;
    const params = `${cardId ? "contact" : "agent"}=${token}`;
    const url = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/assets/${blockId}?${params}`;
    return new Promise(function(resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onprogress = (ev) => {
        try {
          progress(ev.loaded * 100 / ev.total);
        } catch (err) {
          xhr.abort();
        }
      };
      xhr.setRequestHeader("Content-Type", "text/plain");
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(xhr.statusText);
        }
      };
      xhr.onerror = () => {
        reject(xhr.statusText);
      };
      xhr.send();
    });
  }
  uploadBlock(block, topicId, progress) {
    const { cardId, channelId, connection } = this;
    if (!connection) {
      throw new Error("disconnected from channel");
    }
    const { node, secure, token } = connection;
    const params = `${cardId ? "contact" : "agent"}=${token}`;
    const url = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/blocks?${params}`;
    return new Promise(function(resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "text/plain");
      xhr.upload.onprogress = (ev) => {
        progress(ev.loaded * 100 / ev.total);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.response).assetId);
          } catch (err) {
            reject("invalid block response");
          }
        } else {
          reject(xhr.statusText);
        }
      };
      xhr.onerror = () => {
        reject(xhr.statusText);
      };
      xhr.send(block);
    });
  }
  mirrorFile(source, topicId, progress) {
    const { cardId, channelId, connection } = this;
    if (!connection) {
      throw new Error("disconnected from channel");
    }
    const { node, secure, token } = connection;
    const params = `${cardId ? "contact" : "agent"}=${token}&body=multipart`;
    const url = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/blocks?${params}`;
    const formData = new FormData();
    if (typeof source === "string") {
      formData.append("asset", { uri: source, name: "asset", type: "application/octent-stream" });
    } else {
      formData.append("asset", source);
    }
    return new Promise(function(resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.upload.onprogress = (ev) => {
        progress(ev.loaded * 100 / ev.total);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.response));
          } catch (err) {
            reject("invalid asset response");
          }
        } else {
          reject(xhr.statusText);
        }
      };
      xhr.onerror = () => {
        reject(xhr.statusText);
      };
      xhr.send(formData);
    });
  }
  transformFile(source, topicId, transforms, progress) {
    const { cardId, channelId, connection } = this;
    if (!connection) {
      throw new Error("disconnected from channel");
    }
    const { node, secure, token } = connection;
    const params = `${cardId ? "contact" : "agent"}=${token}&transforms=${encodeURIComponent(JSON.stringify(transforms))}`;
    const url = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/assets?${params}`;
    const formData = new FormData();
    if (typeof source === "string") {
      formData.append("asset", { uri: source, name: "asset", type: "application/octent-stream" });
    } else {
      formData.append("asset", source);
    }
    return new Promise(function(resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.upload.onprogress = (ev) => {
        progress(ev.loaded * 100 / ev.total);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.response));
          } catch (err) {
            reject("invalid asset response");
          }
        } else {
          reject(xhr.statusText);
        }
      };
      xhr.onerror = () => {
        reject(xhr.statusText);
      };
      xhr.send(formData);
    });
  }
  addTopic(sealed, type, subject, files, progress) {
    return __async(this, null, function* () {
      const { sealEnabled, channelKey, crypto } = this;
      if (sealed && (!sealEnabled || !channelKey || !crypto)) {
        throw new Error("encryption not set");
      }
      const assetItems = [];
      if (files.length == 0) {
        const data = subject([]);
        if (sealed) {
          if (!crypto || !channelKey) {
            throw new Error("duplicate throw for build warning");
          }
          const subjectString = JSON.stringify({ message: data });
          const { ivHex } = yield crypto.aesIv();
          const { encryptedDataB64 } = yield crypto.aesEncrypt(subjectString, ivHex, channelKey);
          const dataEncrypted = { messageEncrypted: encryptedDataB64, messageIv: ivHex };
          const topicId = yield this.addRemoteChannelTopic(type, dataEncrypted, true);
          this.justAdded = true;
          yield this.sync();
          return topicId;
        } else {
          const topicId = yield this.addRemoteChannelTopic(type, data, true);
          this.justAdded = true;
          yield this.sync();
          return topicId;
        }
      } else {
        let uploadCount = 0;
        const assetProgress = (percent) => {
          progress(Math.floor((uploadCount * 100 + percent) / files.length));
        };
        const topicId = yield this.addRemoteChannelTopic(type, {}, false);
        try {
          const appAsset = [];
          if (sealed) {
            for (const asset of files) {
              for (const transform of asset.transforms) {
                if (transform.type === "thumb" /* Thumb */ && transform.thumb) {
                  const assetItem = {
                    assetId: `${assetItems.length}`,
                    encrytped: true,
                    hosting: "inline" /* Inline */,
                    inline: yield transform.thumb()
                  };
                  appAsset.push({ appId: transform.appId, assetId: assetItem.assetId });
                  assetItems.push(assetItem);
                } else if (transform.type === "copy" /* Copy */) {
                  const { staging } = this;
                  if (!staging) {
                    throw new Error("staging file processing support not enabled");
                  }
                  if (!crypto || !channelKey) {
                    throw new Error("duplicate throw for build warning");
                  }
                  const stagingFile = yield staging.read(asset.source);
                  const split = [];
                  for (let i = 0; i * ENCRYPT_BLOCK_SIZE < stagingFile.size; i++) {
                    const length = stagingFile.size - i * ENCRYPT_BLOCK_SIZE > ENCRYPT_BLOCK_SIZE ? ENCRYPT_BLOCK_SIZE : stagingFile.size - i * ENCRYPT_BLOCK_SIZE;
                    const base64Data = yield stagingFile.getData(i * ENCRYPT_BLOCK_SIZE, length);
                    const { ivHex } = yield crypto.aesIv();
                    const { encryptedDataB64 } = yield crypto.aesEncrypt(base64Data, ivHex, channelKey);
                    const partId = yield this.uploadBlock(encryptedDataB64, topicId, (percent) => {
                      const count = Math.ceil(stagingFile.size / ENCRYPT_BLOCK_SIZE);
                      return assetProgress(Math.floor((i * 100 + percent) / count));
                    });
                    split.push({ partId, blockIv: ivHex });
                  }
                  uploadCount += 1;
                  const assetItem = {
                    assetId: `${assetItems.length}`,
                    encrypted: true,
                    hosting: "split" /* Split */,
                    split
                  };
                  appAsset.push({ appId: transform.appId, assetId: assetItem.assetId });
                  assetItems.push(assetItem);
                } else {
                  throw new Error("transform not supported");
                }
              }
            }
          } else {
            for (const asset of files) {
              const transforms = [];
              const transformMap = /* @__PURE__ */ new Map();
              for (let transform of asset.transforms) {
                if (transform.type === "thumb" /* Thumb */ && asset.type === "image" /* Image */) {
                  transforms.push("ithumb;photo");
                  transformMap.set("ithumb;photo", transform.appId);
                } else if (transform.type === "high" /* HighQuality */ && asset.type === "image" /* Image */) {
                  transforms.push("ilg;photo");
                  transformMap.set("ilg;photo", transform.appId);
                } else if (transform.type === "copy" /* Copy */ && asset.type === "image" /* Image */) {
                  transforms.push("icopy;photo");
                  transformMap.set("icopy;photo", transform.appId);
                } else if (transform.type === "thumb" /* Thumb */ && asset.type === "video" /* Video */) {
                  const transformKey = `vthumb;video;${transform.position ? transform.position : 0}`;
                  transforms.push(transformKey);
                  transformMap.set(transformKey, transform.appId);
                } else if (transform.type === "copy" /* Copy */ && asset.type === "video" /* Video */) {
                  transforms.push("vcopy;video");
                  transformMap.set("vcopy;video", transform.appId);
                } else if (transform.type === "high" /* HighQuality */ && asset.type === "video" /* Video */) {
                  transforms.push("vhd;video");
                  transformMap.set("vhd;video", transform.appId);
                } else if (transform.type === "low" /* LowQuality */ && asset.type === "video" /* Video */) {
                  transforms.push("vlq;video");
                  transformMap.set("vlq;video", transform.appId);
                } else if (transform.type === "copy" /* Copy */ && asset.type === "audio" /* Audio */) {
                  transforms.push("acopy;audio");
                  transformMap.set("acopy;audio", transform.appId);
                } else if (transform.type === "copy" /* Copy */ && asset.type === "binary" /* Binary */) {
                  const { assetId } = yield this.mirrorFile(asset.source, topicId, assetProgress);
                  uploadCount += 1;
                  const assetItem = {
                    assetId: `${assetItems.length}`,
                    hosting: "basic" /* Basic */,
                    basic: assetId
                  };
                  appAsset.push({ appId: transform.appId, assetId: assetItem.assetId });
                  assetItems.push(assetItem);
                } else {
                  throw new Error("transform not supported");
                }
              }
              if (transforms.length > 0) {
                const transformAssets = yield this.transformFile(asset.source, topicId, transforms, assetProgress);
                uploadCount += 1;
                for (let transformAsset of transformAssets) {
                  const assetItem = {
                    assetId: `${assetItems.length}`,
                    hosting: "basic" /* Basic */,
                    basic: transformAsset.assetId
                  };
                  if (transformMap.has(transformAsset.transform)) {
                    const appId = transformMap.get(transformAsset.transform) || "";
                    appAsset.push({ appId, assetId: assetItem.assetId });
                    assetItems.push(assetItem);
                  }
                }
              }
            }
          }
          const { text, textColor, textSize, assets } = subject(appAsset);
          const getAsset = (assetId) => {
            const index = parseInt(assetId);
            const item = assetItems[index];
            if (!item) {
              throw new Error("invalid assetId in subject");
            }
            if (item.hosting === "inline" /* Inline */) {
              return item.inline;
            } else if (item.hosting === "split" /* Split */) {
              return item.split;
            } else if (item.hosting === "basic" /* Basic */) {
              return item.basic;
            } else {
              throw new Error("unknown hosting mode");
            }
          };
          const filtered = !assets ? [] : assets.filter((asset) => {
            if (sealed && asset.encrypted) {
              return true;
            } else if (!sealed && !asset.encrypted) {
              return true;
            } else {
              return false;
            }
          });
          const mapped = filtered.map((asset) => {
            if (asset.encrypted) {
              const { type: type2, thumb, label, extension, parts } = asset.encrypted;
              if (type2 === "image" || type2 === "video") {
                return { encrypted: { type: type2, thumb: getAsset(thumb), parts: getAsset(parts) } };
              } else if (type2 === "audio") {
                return { encrypted: { type: type2, label, parts: getAsset(parts) } };
              } else {
                return { encrypted: { type: type2, label, extension, parts: getAsset(parts) } };
              }
            } else if (asset.image) {
              const { thumb, full } = asset.image;
              return { image: { thumb: getAsset(thumb), full: getAsset(full) } };
            } else if (asset.video) {
              const { thumb, lq, hd } = asset.video;
              return { video: { thumb: getAsset(thumb), lq: getAsset(lq), hd: getAsset(hd) } };
            } else if (asset.audio) {
              const { label, full } = asset.audio;
              return { audio: { label, full: getAsset(full) } };
            } else if (asset.binary) {
              const { label, extension, data } = asset.binary;
              return { binary: { label, extension, data: getAsset(data) } };
            }
          });
          const updated = { text, textColor, textSize, assets: mapped };
          if (sealed) {
            if (!crypto || !channelKey) {
              throw new Error("encryption not set");
            }
            const subjectString = JSON.stringify({ message: updated });
            const { ivHex } = yield crypto.aesIv();
            const { encryptedDataB64 } = yield crypto.aesEncrypt(subjectString, ivHex, channelKey);
            const data = { messageEncrypted: encryptedDataB64, messageIv: ivHex };
            yield this.setRemoteChannelTopicSubject(topicId, type, data);
          } else {
            yield this.setRemoteChannelTopicSubject(topicId, type, updated);
          }
        } catch (err) {
          this.log.error(err);
          yield this.removeRemoteChannelTopic(topicId);
          throw new Error("failed to add topic");
        }
        this.justAdded = true;
        yield this.sync();
        return topicId;
      }
    });
  }
  setTopicSubject(topicId, type, subject, files, progress) {
    return __async(this, null, function* () {
      const entry = this.topicEntries.get(topicId);
      if (!entry) {
        throw new Error("topic not found");
      }
      const { item } = entry;
      const { sealed } = item.detail;
      const { sealEnabled, channelKey, crypto } = this;
      if (sealed && (!sealEnabled || !channelKey || !crypto)) {
        throw new Error("encryption not set");
      }
      const { assets: assetItems } = this.getTopicData(item);
      const appAsset = [];
      if (sealed) {
        for (const asset of files) {
          for (const transform of asset.transforms) {
            if (transform.type === "thumb" /* Thumb */ && transform.thumb) {
              const assetItem = {
                assetId: `${assetItems.length}`,
                hosting: "inline" /* Inline */,
                inline: yield transform.thumb()
              };
              appAsset.push({ appId: transform.appId, assetId: assetItem.assetId });
              assetItems.push(assetItem);
            } else if (transform.type === "copy" /* Copy */) {
              const { staging } = this;
              if (!staging) {
                throw new Error("staging file processing support not enabled");
              }
              if (!crypto || !channelKey) {
                throw new Error("duplicate throw for build warning");
              }
              const stagingFile = yield staging.read(asset.source);
              const split = [];
              for (let i = 0; i * ENCRYPT_BLOCK_SIZE < stagingFile.size; i++) {
                const length = stagingFile.size - i * ENCRYPT_BLOCK_SIZE > ENCRYPT_BLOCK_SIZE ? ENCRYPT_BLOCK_SIZE : stagingFile.size - i * ENCRYPT_BLOCK_SIZE;
                const base64Data = yield stagingFile.getData(i * ENCRYPT_BLOCK_SIZE, length);
                const { ivHex } = yield crypto.aesIv();
                const { encryptedDataB64 } = yield crypto.aesEncrypt(base64Data, ivHex, channelKey);
                const partId = yield this.uploadBlock(encryptedDataB64, topicId, progress);
                split.push({ partId, blockIv: ivHex });
              }
              const assetItem = {
                assetId: `${assetItems.length}`,
                hosting: "split" /* Split */,
                split
              };
              appAsset.push({ appId: transform.appId, assetId: assetItem.assetId });
              assetItems.push(assetItem);
            } else {
              throw new Error("transform not supported");
            }
          }
        }
      } else {
        for (const asset of files) {
          const transforms = [];
          const transformMap = /* @__PURE__ */ new Map();
          for (let transform of asset.transforms) {
            if (transform.type === "thumb" /* Thumb */ && asset.type === "image" /* Image */) {
              transforms.push("ithumb;photo");
              transformMap.set("ithumb;photo", transform.appId);
            } else if (transform.type === "copy" /* Copy */ && asset.type === "image" /* Image */) {
              transforms.push("icopy;photo");
              transformMap.set("icopy;photo", transform.appId);
            } else if (transform.type === "thumb" /* Thumb */ && asset.type === "video" /* Video */) {
              transforms.push("vthumb;video");
              transformMap.set("vthumb;video", transform.appId);
            } else if (transform.type === "copy" /* Copy */ && asset.type === "video" /* Video */) {
              transforms.push("vcopy;video");
              transformMap.set("vcopy;video", transform.appId);
            } else if (transform.type === "low" /* LowQuality */ && asset.type === "video" /* Video */) {
              transforms.push("vlq;video");
              transformMap.set("vlq;video", transform.appId);
            } else if (transform.type === "copy" /* Copy */ && asset.type === "audio" /* Audio */) {
              transforms.push("acopy;audio");
              transformMap.set("acopy;audio", transform.appId);
            } else if (transform.type === "copy" /* Copy */ && asset.type === "binary" /* Binary */) {
              const { assetId } = yield this.mirrorFile(asset.source, topicId, progress);
              const assetItem = {
                assetId: `${assetItems.length}`,
                hosting: "basic" /* Basic */,
                basic: assetId
              };
              appAsset.push({ appId: transform.appId, assetId: assetItem.assetId });
              assetItems.push(assetItem);
            } else {
              throw new Error("transform not supported");
            }
          }
          if (transforms.length > 0) {
            const transformAssets = yield this.transformFile(asset.source, topicId, transforms, progress);
            for (let transformAsset of transformAssets) {
              const assetItem = {
                assetId: `${assetItems.length}`,
                hosting: "basic" /* Basic */,
                basic: transformAsset.assetId
              };
              if (transformMap.get(assetItem.assetId)) {
                const appId = transformMap.get(assetItem.assetId) || "";
                appAsset.push({ appId, assetId: assetItem.assetId });
                assetItems.push(assetItem);
              }
            }
          }
        }
      }
      const { text, textColor, textSize, assets } = subject(appAsset);
      const getAsset = (assetId) => {
        const index = parseInt(assetId);
        const item2 = assetItems[index];
        if (!item2) {
          throw new Error("invalid assetId in subject");
        }
        if (item2.hosting === "inline" /* Inline */) {
          return item2.inline;
        }
        if (item2.hosting === "split" /* Split */) {
          return item2.split;
        }
        if (item2.hosting === "basic" /* Basic */) {
          return item2.basic;
        } else {
          throw new Error("unknown hosting mode");
        }
      };
      const filtered = !assets ? [] : assets.filter((asset) => {
        if (sealed && asset.encrypted) {
          return true;
        } else if (!sealed && !asset.encrypted) {
          return true;
        } else {
          return false;
        }
      });
      const mapped = filtered.map((asset) => {
        if (sealed) {
          const { type: type2, thumb, parts } = asset.encrypted;
          return { encrypted: { type: type2, thumb: getAsset(thumb), parts: getAsset(parts) } };
        } else if (asset.image) {
          const { thumb, full } = asset.image;
          return { image: { thumb: getAsset(thumb), full: getAsset(full) } };
        } else if (asset.video) {
          const { thumb, lq, hd } = asset.video;
          return { video: { thumb: getAsset(thumb), lq: getAsset(lq), hd: getAsset(hd) } };
        } else if (asset.audio) {
          const { label, full } = asset.audio;
          return { audio: { label, full: getAsset(full) } };
        } else if (asset.binary) {
          const { label, extension, data } = asset.binary;
          return { binary: { label, extension, data: getAsset(data) } };
        }
      });
      const updated = { text, textColor, textSize, assets: mapped };
      if (sealed) {
        if (!crypto || !channelKey) {
          throw new Error("encryption not set");
        }
        const subjectString = JSON.stringify({ message: updated });
        const { ivHex } = yield crypto.aesIv();
        const { encryptedDataB64 } = yield crypto.aesEncrypt(subjectString, ivHex, channelKey);
        const data = { messageEncrypted: encryptedDataB64, messageIv: ivHex };
        return yield this.setRemoteChannelTopicSubject(topicId, type, data);
      } else {
        return yield this.setRemoteChannelTopicSubject(topicId, type, updated);
      }
    });
  }
  removeTopic(topicId) {
    return __async(this, null, function* () {
      yield this.removeRemoteChannelTopic(topicId);
    });
  }
  getTopicAssetUrl(topicId, assetId, progress) {
    return __async(this, null, function* () {
      const entry = this.topicEntries.get(topicId);
      if (!entry) {
        throw new Error("topic entry not found");
      }
      const { assets } = this.getTopicData(entry.item);
      if (!assets) {
        throw new Error("asset entry not found");
      }
      const asset = assets.find((item) => item.assetId === assetId);
      if (!asset) {
        throw new Error("asset entry not found");
      }
      if (asset.hosting === "inline" /* Inline */ && asset.inline) {
        return `${asset.inline}`;
      } else if (asset.hosting === "basic" /* Basic */ && asset.basic) {
        return this.getRemoteChannelTopicAssetUrl(topicId, asset.basic);
      } else if (asset.hosting === "split" /* Split */ && asset.split) {
        const { sealEnabled, channelKey, crypto, staging } = this;
        if (!sealEnabled || !channelKey || !crypto || !staging) {
          throw new Error("staging file decryption not set");
        }
        const write = yield staging.write();
        this.closeStaging.push(write.close);
        const assetCount = asset.split.length;
        for (let i = 0; i < assetCount; i++) {
          if (progress) {
            const download = progress(Math.floor(i * 100 / assetCount));
            if (download === false) {
              throw new Error("aborted asset load");
            }
          }
          const block = yield this.downloadBlock(topicId, asset.split[i].partId, (percent) => {
            if (progress) {
              const download = progress(Math.floor((i * 100 + percent) / assetCount));
              if (download === false) {
                throw new Error("aborting asset load");
              }
            }
          });
          const { data } = yield crypto.aesDecrypt(block, asset.split[i].blockIv, channelKey);
          yield write.setData(data);
        }
        return yield write.getUrl();
      } else {
        throw new Error("unknown hosting mode");
      }
    });
  }
  flagTopic(topicId) {
    return __async(this, null, function* () {
      this.flagChannelTopic(topicId);
    });
  }
  setBlockTopic(topicId) {
    return __async(this, null, function* () {
      const { cardId, channelId, guid } = this;
      const entry = this.topicEntries.get(topicId);
      if (entry) {
        const id = `${cardId ? cardId : ""}:${channelId}:${topicId}`;
        this.blocked.add(id);
        entry.topic = this.setTopic(topicId, entry.item);
        this.emitTopics();
        const timestamp = Math.floor(Date.now() / 1e3);
        yield this.store.setMarker(guid, "blocked_topic", id, JSON.stringify({ cardId, channelId, topicId, timestamp }));
      }
    });
  }
  clearBlockTopic(topicId) {
    return __async(this, null, function* () {
      const { cardId, channelId, guid } = this;
      const entry = this.topicEntries.get(topicId);
      if (entry) {
        const id = `${cardId ? cardId : ""}:${channelId}:${topicId}`;
        this.blocked.delete(id);
        entry.topic = this.setTopic(topicId, entry.item);
        this.emitTopics();
        yield this.store.clearMarker(guid, "blocked_topic", id);
      }
    });
  }
  clearBlockedChannelTopic(cardId, channelId, topicId) {
    return __async(this, null, function* () {
      if (cardId === this.cardId && channelId === this.channelId) {
        yield this.clearBlockTopic(topicId);
      }
    });
  }
  isTopicBlocked(topicId) {
    const { cardId, channelId, guid } = this;
    const id = `${cardId ? cardId : ""}:${channelId}:${topicId}`;
    return this.blocked.has(id);
  }
  unsealTopicDetail(item) {
    return __async(this, null, function* () {
      if (item.detail.status === "confirmed" && item.detail.sealed && !item.unsealedDetail && this.sealEnabled && this.channelKey && this.crypto) {
        try {
          const { messageEncrypted, messageIv } = item.detail.data;
          if (!messageEncrypted || !messageIv) {
            this.log.warn("invalid sealed topic");
          } else {
            const { data } = yield this.crypto.aesDecrypt(messageEncrypted, messageIv, this.channelKey);
            const { message } = JSON.parse(data);
            item.unsealedDetail = message;
            return true;
          }
        } catch (err) {
          this.log.warn(err);
        }
      }
      return false;
    });
  }
  viewMoreTopics() {
    return __async(this, null, function* () {
      this.loadMore = true;
      yield this.sync();
    });
  }
  addTopicListener(ev) {
    this.emitter.on("topic", ev);
    const topics = this.loaded ? Array.from(this.topicEntries, ([topicId, entry]) => entry.topic) : null;
    ev(topics);
  }
  removeTopicListener(ev) {
    this.emitter.off("topic", ev);
  }
  emitTopics() {
    this.loaded = true;
    const topics = Array.from(this.topicEntries, ([topicId, entry]) => entry.topic);
    this.emitter.emit("topic", topics);
  }
  addOffsyncListener(ev) {
    this.emitter.on("offsync", ev);
    ev(this.offsync);
  }
  removeOffsyncListener(ev) {
    this.emitter.off("offsync", ev);
  }
  emitOffsync() {
    this.emitter.emit("offsync", this.offsync);
  }
  addDetailListener(ev) {
    var _a;
    const { cardId, channelId } = this;
    const access = Boolean(this.connection && (!((_a = this.focusDetail) == null ? void 0 : _a.sealed) || this.sealEnabled && this.channelKey));
    const detail = access ? this.focusDetail : null;
    this.emitter.on("detail", ev);
    ev({ cardId, channelId, detail });
  }
  removeDetailListener(ev) {
    this.emitter.off("detail", ev);
  }
  emitDetail() {
    var _a;
    const { cardId, channelId } = this;
    const access = Boolean(this.connection && (!((_a = this.focusDetail) == null ? void 0 : _a.sealed) || this.sealEnabled && this.channelKey));
    const detail = access ? this.focusDetail : null;
    this.emitter.emit("detail", { cardId, channelId, detail });
  }
  disconnect(cardId, channelId) {
    if (cardId === this.cardId && channelId === this.channelId) {
      this.connection = null;
      this.emitDetail();
    }
  }
  setDetail(cardId, channelId, detail) {
    if (cardId === this.cardId && channelId === this.channelId) {
      this.focusDetail = detail;
      this.emitDetail();
    }
  }
  setRevision(cardId, channelId, revision) {
    return __async(this, null, function* () {
      if (cardId === this.cardId && channelId === this.channelId) {
        this.nextRevision = revision;
        yield this.sync();
      }
    });
  }
  setSealEnabled(enable) {
    return __async(this, null, function* () {
      this.sealEnabled = enable;
      this.unsealAll = true;
      this.emitDetail();
      yield this.sync();
    });
  }
  setChannelKey(cardId, channelId, channelKey) {
    return __async(this, null, function* () {
      if (cardId === this.cardId && channelId === this.channelId) {
        this.channelKey = channelKey;
        this.unsealAll = true;
        this.emitDetail();
        yield this.sync();
      }
    });
  }
  close() {
    return __async(this, null, function* () {
      this.closing = true;
      while (this.syncing) {
        yield new Promise((r) => setTimeout(r, CLOSE_POLL_MS3));
      }
      this.closeStaging.forEach((item) => {
        item();
      });
    });
  }
  getFocused() {
    const { cardId, channelId } = this;
    return { cardId, channelId };
  }
  getTopicData(item) {
    const topicDetail = item.detail.sealed ? item.unsealedDetail : item.detail.data;
    return getLegacyData(topicDetail);
  }
  setTopic(topicId, item) {
    const { data, assets } = this.getTopicData(item);
    return {
      topicId,
      data,
      guid: item.detail.guid,
      blocked: this.isTopicBlocked(topicId),
      sealed: item.detail.sealed,
      locked: item.detail.sealed && (!this.sealEnabled || !this.channelKey),
      dataType: item.detail.dataType,
      created: item.detail.created,
      updated: item.detail.updated,
      status: item.detail.status,
      transform: item.detail.transform,
      assets: assets.map((asset) => {
        const { assetId, hosting } = asset;
        return { assetId, hosting };
      }),
      readByMe: item.detail.readByMe
    };
  }
  getTopicDetail(entity, revision) {
    const { guid, dataType, data, created, updated, status, transform, readByMe } = entity;
    return {
      revision,
      guid,
      sealed: dataType == "sealedtopic",
      data: this.parse(data),
      dataType,
      created,
      updated,
      status,
      transform,
      readByMe
    };
  }
  getTopicEntry(topicId) {
    return __async(this, null, function* () {
      const { cardId, channelId, guid } = this;
      const entry = this.topicEntries.get(topicId);
      if (entry) {
        return entry;
      }
      const item = JSON.parse(JSON.stringify(defaultTopicItem));
      const topic = this.setTopic(topicId, item);
      const topicEntry = { item, topic };
      this.topicEntries.set(topicId, topicEntry);
      yield this.addLocalChannelTopic(topicId, item);
      return topicEntry;
    });
  }
  getChannelTopicRevision() {
    return __async(this, null, function* () {
      const { guid, cardId, channelId } = this;
      if (cardId) {
        return yield this.store.getContactCardChannelTopicRevision(guid, cardId, channelId);
      } else {
        return yield this.store.getContentChannelTopicRevision(guid, channelId);
      }
    });
  }
  setChannelTopicRevision(sync) {
    return __async(this, null, function* () {
      const { guid, cardId, channelId } = this;
      if (cardId) {
        yield this.store.setContactCardChannelTopicRevision(guid, cardId, channelId, sync);
      } else {
        yield this.store.setContentChannelTopicRevision(guid, channelId, sync);
      }
    });
  }
  getLocalChannelTopics(offset) {
    return __async(this, null, function* () {
      const { guid, cardId, channelId } = this;
      if (cardId) {
        return yield this.store.getContactCardChannelTopics(guid, cardId, channelId, BATCH_COUNT, offset);
      } else {
        return yield this.store.getContentChannelTopics(guid, channelId, BATCH_COUNT, offset);
      }
    });
  }
  addLocalChannelTopic(topicId, item) {
    return __async(this, null, function* () {
      const { guid, cardId, channelId } = this;
      if (cardId) {
        yield this.store.addContactCardChannelTopic(guid, cardId, channelId, topicId, item);
      } else {
        yield this.store.addContentChannelTopic(guid, channelId, topicId, item);
      }
    });
  }
  removeLocalChannelTopic(topicId) {
    return __async(this, null, function* () {
      const { guid, cardId, channelId } = this;
      if (cardId) {
        yield this.store.removeContactCardChannelTopic(guid, cardId, channelId, topicId);
      } else {
        yield this.store.removeContentChannelTopic(guid, channelId, topicId);
      }
    });
  }
  setLocalChannelTopicDetail(topicId, detail, unsealedDetail, position) {
    return __async(this, null, function* () {
      const { guid, cardId, channelId } = this;
      if (cardId) {
        yield this.store.setContactCardChannelTopicDetail(guid, cardId, channelId, topicId, detail, unsealedDetail, position);
      } else {
        yield this.store.setContentChannelTopicDetail(guid, channelId, topicId, detail, unsealedDetail, position);
      }
    });
  }
  setLocalChannelTopicUnsealedDetail(topicId, unsealedDetail) {
    return __async(this, null, function* () {
      const { guid, cardId, channelId } = this;
      if (cardId) {
        yield this.store.setContactCardChannelTopicUnsealedDetail(guid, cardId, channelId, topicId, unsealedDetail);
      } else {
        yield this.store.setContentChannelTopicUnsealedDetail(guid, channelId, topicId, unsealedDetail);
      }
    });
  }
  getRemoteChannelTopicAssetUrl(topicId, assetId) {
    const { cardId, channelId, connection } = this;
    if (!connection) {
      throw new Error("disconnected channel");
    }
    const { node, secure, token } = connection;
    return `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/topics/${topicId}/assets/${assetId}?${cardId ? "contact" : "agent"}=${token}`;
  }
  getRemoteChannelTopics(revision, begin, end) {
    return __async(this, null, function* () {
      const { cardId, channelId, connection } = this;
      if (!connection) {
        throw new Error("disconnected channel");
      }
      const { node, secure, token } = connection;
      if (cardId) {
        return yield getContactChannelTopics(node, secure, token, channelId, revision, end || !revision ? BATCH_COUNT : null, begin, end);
      } else {
        return yield getChannelTopics(node, secure, token, channelId, revision, end || !revision ? BATCH_COUNT : null, begin, end);
      }
    });
  }
  getRemoteChannelTopicDetail(topicId) {
    return __async(this, null, function* () {
      const { cardId, channelId, connection } = this;
      if (!connection) {
        throw new Error("disconnected channel");
      }
      const { node, secure, token } = connection;
      if (cardId) {
        return yield getContactChannelTopicDetail(node, secure, token, channelId, topicId);
      } else {
        return yield getChannelTopicDetail(node, secure, token, channelId, topicId);
      }
    });
  }
  addRemoteChannelTopic(dataType, data, confirm) {
    return __async(this, null, function* () {
      const { cardId, channelId, connection } = this;
      if (!connection) {
        throw new Error("disconnected channel");
      }
      const { node, secure, token } = connection;
      if (cardId) {
        return yield addContactChannelTopic(node, secure, token, channelId, dataType, data, confirm);
      } else {
        return yield addChannelTopic(node, secure, token, channelId, dataType, data, confirm);
      }
    });
  }
  setRemoteChannelTopicSubject(topicId, dataType, data) {
    return __async(this, null, function* () {
      const { cardId, channelId, connection } = this;
      if (!connection) {
        throw new Error("disconnected from channel");
      }
      const { node, secure, token } = connection;
      if (cardId) {
        return yield setContactChannelTopicSubject(node, secure, token, channelId, topicId, dataType, data);
      } else {
        return yield setChannelTopicSubject(node, secure, token, channelId, topicId, dataType, data);
      }
    });
  }
  markTopicRead(topicId) {
    return __async(this, null, function* () {
      const { cardId, channelId, connection } = this;
      if (!connection || !connection.token) {
        throw new Error("disconnected from channel");
      }
      const token = connection.token;
      if (!token || token.length < 10) {
        throw new Error("invalid token format");
      }
      if (_FocusModule.checkRateLimit()) {
        throw new Error("rate limited: too many recent failures");
      }
      const { node, secure } = connection;
      try {
        if (cardId) {
          yield setContactChannelTopicRead(node, secure, token, channelId, topicId);
        } else {
          yield setChannelTopicRead(node, secure, token, channelId, topicId);
        }
        _FocusModule.recordSuccess();
      } catch (err) {
        _FocusModule.recordFailure();
        throw err;
      }
    });
  }
  static checkRateLimit() {
    const now = Date.now();
    if (now - _FocusModule.lastFailureTime > _FocusModule.RATE_LIMIT_WINDOW) {
      _FocusModule.failureCount = 0;
    }
    if (now < _FocusModule.rateLimitedUntil) {
      return true;
    }
    if (_FocusModule.failureCount >= _FocusModule.RATE_LIMIT_MAX_FAILURES) {
      _FocusModule.rateLimitedUntil = now + 3e4;
      _FocusModule.failureCount = 0;
      console.warn("[markTopicRead] Rate limit reached, waiting for cooldown");
      return true;
    }
    return false;
  }
  static recordSuccess() {
    _FocusModule.failureCount = 0;
    _FocusModule.rateLimitedUntil = 0;
  }
  static recordFailure() {
    const now = Date.now();
    _FocusModule.lastFailureTime = now;
    _FocusModule.failureCount++;
    console.warn(`[markTopicRead] Request failed (total: ${_FocusModule.failureCount})`);
  }
  getTopicReadReceipts(topicId) {
    return __async(this, null, function* () {
      const { cardId, channelId, connection } = this;
      if (!connection || !connection.token) {
        throw new Error("disconnected from channel");
      }
      const { node, secure, token } = connection;
      if (cardId) {
        return yield getContactChannelTopicReads(node, secure, token, channelId, topicId);
      } else {
        return yield getChannelTopicReads(node, secure, token, channelId, topicId);
      }
    });
  }
  parse(data) {
    if (data) {
      try {
        if (data == null) {
          return null;
        }
        return JSON.parse(data);
      } catch (err) {
        this.log.warn("invalid channel data");
      }
    }
    return {};
  }
};
_FocusModule.RATE_LIMIT_WINDOW = 6e4;
_FocusModule.RATE_LIMIT_MAX_FAILURES = 5;
_FocusModule.failureCount = 0;
_FocusModule.lastFailureTime = 0;
_FocusModule.rateLimitedUntil = 0;
var FocusModule = _FocusModule;

// src/net/addCall.ts
function addCall(node, secure, token, cardId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/talk/calls?agent=${token}`;
    const call = yield fetchWithTimeout(endpoint, { method: "POST", body: JSON.stringify(cardId) });
    checkResponse(call.status);
    return yield call.json();
  });
}

// src/net/removeCall.ts
function removeCall(node, secure, token, callId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/talk/calls/${callId}?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(status);
  });
}

// src/net/addContactRing.ts
function addContactRing(server, secure, guid, token, ringing) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/talk/rings?contact=${guid}.${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "POST", body: JSON.stringify(ringing) });
    checkResponse(status);
  });
}

// src/net/keepCall.ts
function keepCall(node, secure, token, callId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/talk/calls/${callId}?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "PUT" });
    checkResponse(status);
  });
}

// src/link.ts
var CLOSE_POLL_MS4 = 1e3;
var RETRY_INTERVAL = 1e3;
var RING_INTERVAL = 2e3;
var LinkModule = class {
  constructor(log) {
    this.log = log;
    this.statusListener = null;
    this.messageListener = null;
    this.messages = [];
    this.status = "idle";
    this.error = false;
    this.closed = false;
    this.connected = false;
    this.notifying = false;
    this.websocket = null;
    this.staleInterval = null;
    this.aliveInterval = null;
    this.ringInterval = null;
    this.ice = [];
    this.cleanup = null;
  }
  getIce() {
    return this.ice;
  }
  call(node, secure, token, cardId, contactNode, contactSecure, contactGuid, contactToken) {
    return __async(this, null, function* () {
      const call = yield addCall(node, secure, token, cardId);
      this.cleanup = () => __async(this, null, function* () {
        try {
          yield removeCall(node, secure, token, call.id);
        } catch (err) {
          this.log.error(err);
        }
      });
      const { id, keepAlive, calleeToken, callerToken, ice } = call;
      const ring = { index: 0, callId: id, calleeToken, ice: JSON.parse(JSON.stringify(ice)) };
      yield addContactRing(contactNode, contactSecure, contactGuid, contactToken, ring);
      this.aliveInterval = setInterval(() => __async(this, null, function* () {
        try {
          yield keepCall(node, secure, token, id);
        } catch (err) {
          this.log.error(err);
        }
      }), keepAlive * 1e3);
      this.ringInterval = setInterval(() => __async(this, null, function* () {
        try {
          ring.index += 1;
          yield addContactRing(contactNode, contactSecure, contactGuid, contactToken, ring);
        } catch (err) {
          this.log.error(err);
        }
      }), RING_INTERVAL);
      this.ice = ice;
      this.websocket = this.setWebSocket(callerToken, node, secure);
    });
  }
  join(server, secure, token, ice, endCall) {
    return __async(this, null, function* () {
      this.ice = ice;
      const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
      this.cleanup = () => __async(this, null, function* () {
        try {
          yield endCall();
        } catch (err) {
          this.log.error(err);
        }
      });
      this.websocket = this.setWebSocket(token, server, secure);
    });
  }
  close() {
    return __async(this, null, function* () {
      this.closed = true;
      if (this.staleInterval) {
        clearInterval(this.staleInterval);
        this.staleInterval = null;
      }
      if (this.aliveInterval) {
        clearInterval(this.aliveInterval);
        this.aliveInterval = null;
      }
      if (this.ringInterval) {
        clearInterval(this.ringInterval);
        this.ringInterval = null;
      }
      if (this.websocket) {
        this.websocket.close();
      }
      if (this.cleanup) {
        try {
          this.cleanup();
        } catch (err) {
          this.log.error(err);
        }
      }
      while (this.notifying) {
        yield new Promise((r) => setTimeout(r, CLOSE_POLL_MS4));
      }
    });
  }
  setStatusListener(listener) {
    this.statusListener = listener;
    this.messages.push(JSON.stringify({ status: "echo" }));
    this.notify();
  }
  clearStatusListener() {
    this.statusListener = null;
  }
  setMessageListener(listener) {
    this.messageListener = listener;
    this.notify();
  }
  clearMessageListener() {
    this.messageListener = null;
  }
  sendMessage(message) {
    return __async(this, null, function* () {
      if (this.status !== "connected" || !this.websocket) {
        this.log.error("dropping message while not connected");
      } else {
        this.websocket.send(JSON.stringify(message));
      }
    });
  }
  notify() {
    return __async(this, null, function* () {
      if (!this.notifying && !this.closed) {
        this.notifying = true;
        while (this.messageListener && this.messages.length > 0 && !this.error) {
          const data = this.messages.shift();
          if (data) {
            try {
              const message = JSON.parse(data);
              if (message.status) {
                yield this.notifyStatus(message.status);
              } else {
                yield this.notifyMessage(message);
              }
            } catch (err) {
              this.log.error("failed to process signal message");
              this.notifyStatus("error");
            }
          }
        }
        this.notifying = false;
      }
    });
  }
  notifyStatus(status) {
    return __async(this, null, function* () {
      try {
        this.status = status === "echo" ? this.status : status;
        if (this.statusListener) {
          if (status === "connected") {
            if (this.connected) {
              yield this.statusListener("reconnected");
            } else {
              yield this.statusListener("connected");
              this.connected = true;
            }
          } else {
            yield this.statusListener(status);
          }
        }
      } catch (err) {
        this.log.error("status notification failed");
      }
      if (status === "connected") {
        if (this.ringInterval) {
          clearInterval(this.ringInterval);
          this.ringInterval = null;
        }
      }
    });
  }
  notifyMessage(message) {
    return __async(this, null, function* () {
      try {
        if (this.messageListener) {
          yield this.messageListener(message);
        }
      } catch (err) {
        this.log.warn("message notification failed");
      }
    });
  }
  setWebSocket(token, node, secure) {
    const wsUrl = `ws${secure ? "s" : ""}://${node}/signal`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      this.messages.push(e.data);
      this.notify();
    };
    ws.onclose = (e) => {
      this.messages.push(JSON.stringify({ status: "connecting" }));
      this.notify();
      setTimeout(() => {
        if (ws != null) {
          ws.onmessage = () => {
          };
          ws.onclose = () => {
          };
          ws.onopen = () => {
          };
          ws.onerror = () => {
          };
          if (!this.closed) {
            this.websocket = this.setWebSocket(token, node, secure);
          }
        }
      }, RETRY_INTERVAL);
    };
    ws.onopen = () => {
      ws.send(JSON.stringify({ AppToken: token }));
    };
    ws.onerror = (e) => {
      this.log.error(e);
      ws.close();
    };
    return ws;
  }
};

// src/net/getCards.ts
function getCards(node, secure, token, revision) {
  return __async(this, null, function* () {
    const param = revision ? `&revision=${revision}` : "";
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards?agent=${token}${param}`;
    const cards = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(cards.status);
    return yield cards.json();
  });
}

// src/net/getCardProfile.ts
function getCardProfile(node, secure, token, cardId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards/${cardId}/profile?agent=${token}`;
    const profile = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(profile.status);
    return yield profile.json();
  });
}

// src/net/getCardDetail.ts
function getCardDetail(node, secure, token, cardId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards/${cardId}/detail?agent=${token}`;
    const detail = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(detail.status);
    return yield detail.json();
  });
}

// src/net/setCardProfile.ts
function setCardProfile(node, secure, token, cardId, data) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards/${cardId}/profile?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    checkResponse(status);
  });
}

// src/net/getContactProfile.ts
function getContactProfile(node, secure, guid, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/profile/message?contact=${guid}.${token}`;
    const profile = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(profile.status);
    return yield profile.json();
  });
}

// src/net/getContactChannels.ts
function getContactChannels(node, secure, guid, token, revision, types) {
  return __async(this, null, function* () {
    const type = `types=${encodeURIComponent(JSON.stringify(types))}`;
    const param = revision ? `viewRevision=1&channelRevision=${revision}` : `viewRevision=1`;
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels?contact=${guid}.${token}&${param}&${type}`;
    const channels = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(channels.status);
    return yield channels.json();
  });
}

// src/net/getContactChannelDetail.ts
function getContactChannelDetail(server, secure, guid, token, channelId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/content/channels/${channelId}/detail?contact=${guid}.${token}`;
    const detail = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(detail.status);
    return yield detail.json();
  });
}

// src/net/getContactChannelSummary.ts
function getContactChannelSummary(server, secure, guid, token, channelId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/content/channels/${channelId}/summary?contact=${guid}.${token}`;
    const summary = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(summary.status);
    return yield summary.json();
  });
}

// src/net/getCardImageUrl.ts
function getCardImageUrl(node, secure, token, cardId, revision) {
  return `http${secure ? "s" : ""}://${node}/contact/cards/${cardId}/profile/image?agent=${token}&revision=${revision}`;
}

// src/net/addCard.ts
function addCard(node, secure, token, message) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards?agent=${token}`;
    const card = yield fetchWithTimeout(endpoint, {
      method: "POST",
      body: JSON.stringify(message)
    });
    checkResponse(card.status);
    return yield card.json();
  });
}

// src/net/removeCard.ts
function removeCard(node, secure, token, cardId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards/${cardId}?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(status);
  });
}

// src/net/getContactListing.ts
function getContactListing(node, secure, guid) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/listing/${guid}/message`;
    const listing = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(listing.status);
    return yield listing.json();
  });
}

// src/net/setCardConfirmed.ts
function setCardConfirmed(node, secure, token, cardId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards/${cardId}/status?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      body: JSON.stringify("confirmed")
    });
    checkResponse(status);
  });
}

// src/net/setCardConnecting.ts
function setCardConnecting(node, secure, token, cardId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards/${cardId}/status?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      body: JSON.stringify("connecting")
    });
    checkResponse(status);
  });
}

// src/net/setCardConnected.ts
function setCardConnected(node, secure, token, cardId, access, article, channel, profile) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards/${cardId}/status?agent=${token}&token=${access}&viewRevision=1&articleRevision=${article}&channelRevision=${channel}&profileRevision=${profile}`;
    const { status } = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      body: JSON.stringify("connected")
    });
    checkResponse(status);
  });
}

// src/net/removeContactChannel.ts
function removeContactChannel(node, secure, guid, token, channelId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}?contact=${guid}.${token}`;
    const response = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(response.status);
  });
}

// src/net/getContactChannelNotifications.ts
function getContactChannelNotifications(node, secure, guid, token, channelId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/notification?contact=${guid}.${token}`;
    const notify = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(notify.status);
    return yield notify.json();
  });
}

// src/net/setContactChannelNotifications.ts
function setContactChannelNotifications(node, secure, guid, token, channelId, enabled) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/notification?contact=${guid}.${token}`;
    const notify = yield fetchWithTimeout(endpoint, { method: "PUT", body: JSON.stringify(enabled) });
    checkResponse(notify.status);
  });
}

// src/net/getRegistryImageUrl.ts
function getRegistryImageUrl(node, secure, guid) {
  return `http${secure ? "s" : ""}://${node}/account/listing/${guid}/image`;
}

// src/net/getRegistryListing.ts
function getRegistryListing(handle, server, secure) {
  return __async(this, null, function* () {
    const param = handle ? `?filter=${handle}` : "";
    const endpoint = `http${secure ? "s" : ""}://${server}/account/listing${param}`;
    const listing = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(listing.status);
    return yield listing.json();
  });
}

// src/net/addFlag.ts
function addFlag(node, secure, guid, data) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/flag/${guid}`;
    const response = yield fetchWithTimeout(endpoint, { method: "POST", body: JSON.stringify(data) });
    checkResponse(response.status);
  });
}

// src/net/getCardOpenMessage.ts
function getCardOpenMessage(node, secure, token, cardId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards/${cardId}/openMessage?agent=${token}`;
    const open = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(open.status);
    return yield open.json();
  });
}

// src/net/setCardOpenMessage.ts
function setCardOpenMessage(node, secure, message) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/openMessage`;
    const open = yield fetchWithTimeout(endpoint, { method: "PUT", body: JSON.stringify(message) });
    checkResponse(open.status);
    return yield open.json();
  });
}

// src/net/getCardCloseMessage.ts
function getCardCloseMessage(node, secure, token, cardId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/cards/${cardId}/closeMessage?agent=${token}`;
    const close = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(close.status);
    return yield close.json();
  });
}

// src/net/setCardCloseMessage.ts
function setCardCloseMessage(node, secure, message) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/contact/closeMessage`;
    const close = yield fetchWithTimeout(endpoint, { method: "PUT", body: JSON.stringify(message) });
    checkResponse(close.status);
  });
}

// src/net/removeContactCall.ts
function removeContactCall(server, secure, guid, token, callId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/talk/calls/${callId}?contact=${guid}.${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(status);
  });
}

// src/contact.ts
var CLOSE_POLL_MS5 = 100;
var RETRY_POLL_MS4 = 2e3;
var ContactModule = class {
  constructor(log, store, crypto, staging, guid, token, node, secure, channelTypes) {
    this.guid = guid;
    this.token = token;
    this.node = node;
    this.secure = secure;
    this.log = log;
    this.store = store;
    this.crypto = crypto;
    this.staging = staging;
    this.emitter = new EventEmitter4();
    this.channelTypes = channelTypes;
    this.unsealAll = false;
    this.loaded = false;
    this.focus = null;
    this.seal = null;
    this.cardEntries = /* @__PURE__ */ new Map();
    this.articleEntries = /* @__PURE__ */ new Map();
    this.channelEntries = /* @__PURE__ */ new Map();
    this.resync = /* @__PURE__ */ new Set();
    this.blockedCard = /* @__PURE__ */ new Set();
    this.blockedCardChannel = /* @__PURE__ */ new Set();
    this.read = /* @__PURE__ */ new Map();
    this.offsyncProfileCard = /* @__PURE__ */ new Map();
    this.offsyncArticleCard = /* @__PURE__ */ new Map();
    this.offsyncChannelCard = /* @__PURE__ */ new Map();
    this.revision = 0;
    this.syncing = true;
    this.closing = false;
    this.nextRevision = null;
    this.hasSynced = false;
    this.init();
  }
  init() {
    return __async(this, null, function* () {
      const { guid } = this;
      this.revision = yield this.store.getContactRevision(guid);
      const offsyncProfileCardMarkers = yield this.store.getMarkers(guid, "offsync_profile_card");
      offsyncProfileCardMarkers.forEach((marker) => {
        this.offsyncProfileCard.set(marker.id, parseInt(marker.value));
      });
      const offsyncChannelCardMarkers = yield this.store.getMarkers(guid, "offsync_channel_card");
      offsyncChannelCardMarkers.forEach((marker) => {
        this.offsyncChannelCard.set(marker.id, parseInt(marker.value));
      });
      const offsyncArticleCardMarkers = yield this.store.getMarkers(guid, "offsync_article_card");
      offsyncArticleCardMarkers.forEach((marker) => {
        this.offsyncArticleCard.set(marker.id, parseInt(marker.value));
      });
      const blockedCardMarkers = yield this.store.getMarkers(guid, "blocked_card");
      blockedCardMarkers.forEach((marker) => {
        this.blockedCard.add(marker.id);
      });
      const blockedCardChannelMarkers = yield this.store.getMarkers(guid, "blocked_card_channel");
      blockedCardChannelMarkers.forEach((marker) => {
        this.blockedCardChannel.add(marker.id);
      });
      const readMarkers = yield this.store.getMarkers(guid, "read_card_channel");
      readMarkers.forEach((marker) => {
        this.read.set(marker.id, parseInt(marker.value));
      });
      const hasSyncedMarkers = yield this.store.getMarkers(guid, "first_sync_complete");
      this.hasSynced = hasSyncedMarkers.filter((marker) => marker.id === "contact").length !== 0;
      const articles = yield this.store.getContactCardArticles(guid);
      articles.forEach(({ cardId, articleId, item }) => {
        const articles2 = this.articleEntries.get(cardId);
        const article = this.setArticle(cardId, articleId, item);
        if (!articles2) {
          const entries = /* @__PURE__ */ new Map();
          this.articleEntries.set(cardId, entries);
          entries.set(articleId, { item, article });
        } else {
          articles2.set(articleId, { item, article });
        }
      });
      const channels = yield this.store.getContactCardChannels(guid);
      channels.forEach(({ cardId, channelId, item }) => {
        const channels2 = this.channelEntries.get(cardId);
        const channel = this.setChannel(cardId, channelId, item);
        if (!channels2) {
          const entries = /* @__PURE__ */ new Map();
          this.channelEntries.set(cardId, entries);
          entries.set(channelId, { item, channel });
        } else {
          channels2.set(channelId, { item, channel });
        }
      });
      const cards = yield this.store.getContacts(guid);
      cards.forEach(({ cardId, item }) => {
        const card = this.setCard(cardId, item);
        this.cardEntries.set(cardId, { item, card });
        this.emitArticles(cardId);
        this.emitChannels(cardId);
      });
      this.emitCards();
      this.unsealAll = true;
      this.syncing = false;
      yield this.sync();
      this.emitLoaded();
    });
  }
  setRevision(rev) {
    return __async(this, null, function* () {
      this.nextRevision = rev;
      yield this.sync();
    });
  }
  close() {
    return __async(this, null, function* () {
      this.closing = true;
      if (this.focus) {
        yield this.focus.close();
        this.focus = null;
      }
      while (this.syncing) {
        yield new Promise((r) => setTimeout(r, CLOSE_POLL_MS5));
      }
    });
  }
  isCardBlocked(cardId) {
    return this.blockedCard.has(cardId);
  }
  setCardBlocked(cardId) {
    return __async(this, null, function* () {
      const entry = this.cardEntries.get(cardId);
      if (!entry) {
        throw new Error("card not found");
      }
      this.blockedCard.add(cardId);
      entry.card = this.setCard(cardId, entry.item);
      this.emitCards();
      const timestamp = Math.floor(Date.now() / 1e3);
      yield this.store.setMarker(this.guid, "blocked_card", cardId, JSON.stringify({ cardId, timestamp }));
    });
  }
  clearCardBlocked(cardId) {
    return __async(this, null, function* () {
      const entry = this.cardEntries.get(cardId);
      if (!entry) {
        throw new Error("card not found");
      }
      this.blockedCard.delete(cardId);
      entry.card = this.setCard(cardId, entry.item);
      this.emitCards();
      yield this.store.clearMarker(this.guid, "blocked_card", cardId);
    });
  }
  isChannelBlocked(cardId, channelId) {
    const id = `${cardId}:${channelId}`;
    return this.blockedCardChannel.has(id);
  }
  setChannelBlocked(cardId, channelId) {
    return __async(this, null, function* () {
      const channelsEntry = this.channelEntries.get(cardId);
      if (!channelsEntry) {
        throw new Error("card not found");
      }
      const channelEntry = channelsEntry.get(channelId);
      if (!channelEntry) {
        throw new Error("channel not found");
      }
      const id = `${cardId}:${channelId}`;
      this.blockedCardChannel.add(id);
      channelEntry.channel = this.setChannel(cardId, channelId, channelEntry.item);
      this.emitChannels(cardId);
      const timestamp = Math.floor(Date.now() / 1e3);
      yield this.store.setMarker(this.guid, "blocked_card_channel", id, JSON.stringify({ cardId, channelId, timestamp }));
    });
  }
  clearChannelBlocked(cardId, channelId) {
    return __async(this, null, function* () {
      const channelsEntry = this.channelEntries.get(cardId);
      if (!channelsEntry) {
        throw new Error("card not found");
      }
      const channelEntry = channelsEntry.get(channelId);
      if (!channelEntry) {
        throw new Error("channel not found");
      }
      const id = `${cardId}:${channelId}`;
      this.blockedCardChannel.delete(id);
      channelEntry.channel = this.setChannel(cardId, channelId, channelEntry.item);
      this.emitChannels(cardId);
      yield this.store.clearMarker(this.guid, "blocked_card_channel", id);
    });
  }
  isArticleBlocked(cardId, articleId) {
    return false;
  }
  setArticleBlocked(cardId, articleId) {
    return __async(this, null, function* () {
    });
  }
  clearArticleBlocked(cardId, articleId) {
    return __async(this, null, function* () {
    });
  }
  getCardProfileOffsync(cardId) {
    const offsync = this.offsyncProfileCard.get(cardId);
    if (offsync) {
      return offsync;
    } else {
      return null;
    }
  }
  setCardProfileOffsync(cardId, revision) {
    return __async(this, null, function* () {
      this.offsyncProfileCard.set(cardId, revision);
      yield this.store.setMarker(this.guid, "offsync_profile_card", cardId, revision.toString());
    });
  }
  clearCardProfileOffsync(cardId) {
    return __async(this, null, function* () {
      if (this.offsyncProfileCard.has(cardId)) {
        this.offsyncProfileCard.delete(cardId);
        yield this.store.clearMarker(this.guid, "offsync_profile_card", cardId);
      }
    });
  }
  getCardChannelOffsync(cardId) {
    const offsync = this.offsyncChannelCard.get(cardId);
    if (offsync) {
      return offsync;
    } else {
      return null;
    }
  }
  setCardChannelOffsync(cardId, revision) {
    return __async(this, null, function* () {
      this.offsyncChannelCard.set(cardId, revision);
      yield this.store.setMarker(this.guid, "offsync_channel_card", cardId, revision.toString());
    });
  }
  clearCardChannelOffsync(cardId) {
    return __async(this, null, function* () {
      if (this.offsyncChannelCard.has(cardId)) {
        this.offsyncChannelCard.delete(cardId);
        yield this.store.clearMarker(this.guid, "offsync_channel_card", cardId);
      }
    });
  }
  getCardArticleOffsync(cardId) {
    const offsync = this.offsyncArticleCard.get(cardId);
    if (offsync) {
      return offsync;
    } else {
      return null;
    }
  }
  setCardArticleOffsync(cardId, revision) {
    return __async(this, null, function* () {
      this.offsyncArticleCard.set(cardId, revision);
      yield this.store.setMarker(this.guid, "offsync_article_card", cardId, revision.toString());
    });
  }
  clearCardArticleOffsync(cardId) {
    return __async(this, null, function* () {
      if (this.offsyncArticleCard.has(cardId)) {
        this.offsyncArticleCard.delete(cardId);
        yield this.store.clearMarker(this.guid, "offsync_article_card", cardId);
      }
    });
  }
  isChannelUnread(cardId, channelId, revision) {
    const id = `${cardId}:${channelId}`;
    if (this.read.has(id)) {
      const read = this.read.get(id);
      if (read && read >= revision) {
        return false;
      }
    }
    return true;
  }
  markChannelUnread(cardId, channelId, revision) {
    return __async(this, null, function* () {
      const id = `${cardId}:${channelId}`;
      const read = this.read.get(id);
      if (!read || read < revision) {
        this.read.delete(id);
        yield this.store.clearMarker(this.guid, "read_card_channel", id);
      }
    });
  }
  markChannelRead(cardId, channelId, revision) {
    return __async(this, null, function* () {
      const id = `${cardId}:${channelId}`;
      const read = this.read.get(id);
      if (!read || read < revision) {
        this.read.set(id, revision);
        yield this.store.setMarker(this.guid, "read_card_channel", id, revision.toString());
      }
    });
  }
  resyncCard(cardId) {
    return __async(this, null, function* () {
      this.resync.add(cardId);
      yield this.sync();
    });
  }
  sync() {
    return __async(this, null, function* () {
      if (!this.syncing) {
        this.syncing = true;
        const { guid, node, secure, token } = this;
        while ((this.unsealAll || this.nextRevision || this.resync.size) && !this.closing) {
          if (this.resync.size) {
            const entries = Array.from(this.cardEntries, ([key, value]) => ({ key, value }));
            for (const entry of entries) {
              const { key, value } = entry;
              if (this.resync.has(key)) {
                const offsyncProfile = this.getCardProfileOffsync(key);
                if (offsyncProfile) {
                  try {
                    const { profile, detail, profileRevision } = value.item;
                    yield this.syncProfile(key, profile.node, profile.guid, detail.token, profileRevision);
                    value.item.profileRevision = offsyncProfile;
                    yield this.store.setContactCardProfileRevision(guid, key, profileRevision);
                    yield this.clearCardProfileOffsync(key);
                    entry.value.card = this.setCard(key, entry.value.item);
                    this.emitCards();
                  } catch (err) {
                    this.log.warn(err);
                  }
                }
                const offsyncArticle = this.getCardArticleOffsync(key);
                if (offsyncArticle) {
                  try {
                    const { profile, detail, articleRevision } = value.item;
                    yield this.syncArticles(key, profile.node, profile.guid, detail.token, articleRevision);
                    value.item.articleRevision = offsyncArticle;
                    yield this.store.setContactCardArticleRevision(guid, key, articleRevision);
                    yield this.clearCardArticleOffsync(key);
                    entry.value.card = this.setCard(key, entry.value.item);
                    this.emitCards();
                  } catch (err) {
                    this.log.warn(err);
                  }
                }
                const offsyncChannel = this.getCardChannelOffsync(key);
                if (offsyncChannel) {
                  try {
                    const { profile, detail, channelRevision } = value.item;
                    yield this.syncChannels(key, { guid: profile.guid, node: profile.node, token: detail.token }, channelRevision);
                    value.item.channelRevision = offsyncChannel;
                    yield this.store.setContactCardChannelRevision(guid, key, value.item.channelRevision);
                    yield this.clearCardChannelOffsync(key);
                    entry.value.card = this.setCard(key, entry.value.item);
                    this.emitCards();
                  } catch (err) {
                    this.log.warn(err);
                  }
                }
              }
            }
            this.resync.clear();
          }
          if (this.nextRevision && this.revision !== this.nextRevision) {
            const nextRev = this.nextRevision;
            try {
              const delta = yield getCards(node, secure, token, this.revision);
              for (const entity of delta) {
                const { id, revision, data } = entity;
                if (data) {
                  const entry = yield this.getCardEntry(id);
                  if (data.detailRevision !== entry.item.detail.revision) {
                    const detail = data.cardDetail ? data.cardDetail : yield getCardDetail(node, secure, token, id);
                    const { status, statusUpdated, token: cardToken } = detail;
                    entry.item.detail = {
                      revision: data.detailRevision,
                      status,
                      statusUpdated,
                      token: cardToken
                    };
                    entry.card = this.setCard(id, entry.item);
                    yield this.store.setContactCardDetail(guid, id, entry.item.detail);
                  }
                  if (data.profileRevision !== entry.item.profile.revision) {
                    const profile = data.cardProfile ? data.cardProfile : yield getCardProfile(node, secure, token, id);
                    entry.item.profile = {
                      revision: data.profileRevision,
                      handle: profile.handle,
                      guid: profile.guid,
                      name: profile.name,
                      description: profile.description,
                      location: profile.location,
                      imageSet: profile.imageSet,
                      node: profile.node,
                      seal: profile.seal
                    };
                    entry.card = this.setCard(id, entry.item);
                    yield this.store.setContactCardProfile(guid, id, entry.item.profile);
                  }
                  const { profileRevision, articleRevision, channelRevision } = entry.item;
                  if (data.notifiedProfile > entry.item.profile.revision && data.notifiedProfile !== profileRevision) {
                    const offsyncProfile = this.getCardProfileOffsync(id);
                    if (offsyncProfile) {
                      yield this.setCardProfileOffsync(id, data.notifiedProfile);
                      entry.card = this.setCard(id, entry.item);
                    } else {
                      try {
                        yield this.syncProfile(id, entry.item.profile.node, entry.item.profile.guid, entry.item.detail.token, entry.item.profileRevision);
                        entry.item.profileRevision = data.notifiedProfile;
                        yield this.store.setContactCardProfileRevision(guid, id, data.notifiedProfile);
                      } catch (err) {
                        this.log.warn(err);
                        yield this.setCardProfileOffsync(id, data.notifiedProfile);
                        entry.card = this.setCard(id, entry.item);
                      }
                    }
                  }
                  if (data.notifiedArticle !== articleRevision) {
                    const offsyncArticle = this.getCardArticleOffsync(id);
                    if (offsyncArticle) {
                      yield this.setCardArticleOffsync(id, data.notifiedArticle);
                      entry.card = this.setCard(id, entry.item);
                    } else {
                      try {
                        yield this.syncArticles(id, entry.item.profile.node, entry.item.profile.guid, entry.item.detail.token, entry.item.articleRevision);
                        entry.item.articleRevision = data.notifiedArticle;
                        yield this.store.setContactCardArticleRevision(guid, id, data.notifiedArticle);
                        this.emitArticles(id);
                      } catch (err) {
                        this.log.warn(err);
                        yield this.setCardArticleOffsync(id, data.notifiedArticle);
                        entry.card = this.setCard(id, entry.item);
                      }
                    }
                  }
                  if (data.notifiedChannel !== channelRevision) {
                    const offsyncChannel = this.getCardChannelOffsync(id);
                    if (offsyncChannel) {
                      yield this.setCardChannelOffsync(id, data.notifiedChannel);
                      entry.card = this.setCard(id, entry.item);
                    } else {
                      try {
                        const { profile, detail } = entry.item;
                        yield this.syncChannels(id, { guid: profile.guid, node: profile.node, token: detail.token }, entry.item.channelRevision);
                        entry.item.channelRevision = data.notifiedChannel;
                        yield this.store.setContactCardChannelRevision(guid, id, data.notifiedChannel);
                        this.emitChannels(id);
                      } catch (err) {
                        this.log.warn(err);
                        yield this.setCardChannelOffsync(id, data.notifiedChannel);
                        entry.card = this.setCard(id, entry.item);
                      }
                    }
                  }
                } else {
                  this.cardEntries.delete(id);
                  yield this.store.removeContactCard(guid, id);
                  this.channelEntries.delete(id);
                  this.emitChannels(id);
                  this.articleEntries.delete(id);
                  this.emitArticles(id);
                }
              }
              this.emitCards();
              yield this.store.setContactRevision(guid, nextRev);
              this.revision = nextRev;
              this.emitLoaded();
              if (this.nextRevision === nextRev) {
                this.nextRevision = null;
              }
              this.log.info(`card revision: ${nextRev}`);
            } catch (err) {
              this.log.warn(err);
              yield new Promise((r) => setTimeout(r, RETRY_POLL_MS4));
            }
          }
          if (this.revision === this.nextRevision) {
            this.nextRevision = null;
          }
          if (this.unsealAll) {
            for (const [cardId, channels] of this.channelEntries.entries()) {
              for (const [channelId, entry] of channels.entries()) {
                try {
                  const { item } = entry;
                  if (yield this.unsealChannelDetail(cardId, channelId, item)) {
                    yield this.store.setContactCardChannelUnsealedDetail(guid, cardId, channelId, item.unsealedDetail);
                  }
                  if (yield this.unsealChannelSummary(cardId, channelId, item)) {
                    yield this.store.setContactCardChannelUnsealedSummary(guid, cardId, channelId, item.unsealedSummary);
                  }
                  entry.channel = this.setChannel(cardId, channelId, item);
                } catch (err) {
                  this.log.warn(err);
                }
              }
              this.emitChannels(cardId);
            }
            this.unsealAll = false;
          }
        }
        if (this.revision && !this.hasSynced) {
          this.hasSynced = true;
          yield this.store.setMarker(this.guid, "first_sync_complete", "contact", "");
        }
        this.syncing = false;
      }
    });
  }
  syncProfile(cardId, cardNode, cardGuid, cardToken, revision) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const server = cardNode ? cardNode : node;
      const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
      const message = yield getContactProfile(server, !insecure, cardGuid, cardToken);
      yield setCardProfile(node, secure, token, cardId, message);
    });
  }
  syncArticles(cardId, cardNode, cardGuid, cardToken, revision) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const server = cardNode ? cardNode : node;
      const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
    });
  }
  syncChannels(cardId, card, revision) {
    return __async(this, null, function* () {
      const { guid, node, secure, token, channelTypes } = this;
      const server = card.node ? card.node : node;
      const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
      const delta = yield getContactChannels(server, !insecure, card.guid, card.token, revision, channelTypes);
      for (const entity of delta) {
        const { id, revision: revision2, data } = entity;
        if (data) {
          const { detailRevision, topicRevision, channelSummary, channelDetail } = data;
          const entries = this.getChannelEntries(cardId);
          const entry = yield this.getChannelEntry(entries, cardId, id);
          if (detailRevision !== entry.item.detail.revision) {
            const detail = channelDetail ? channelDetail : yield getContactChannelDetail(server, !insecure, card.guid, card.token, id);
            entry.item.detail = {
              revision: detailRevision,
              sealed: detail.dataType === "sealed",
              dataType: detail.dataType,
              data: detail.data,
              created: detail.created,
              updated: detail.updated,
              enableImage: detail.enableImage,
              enableAudio: detail.enableAudio,
              enableVideo: detail.enableVideo,
              enableBinary: detail.enableBinary,
              contacts: detail.contacts,
              members: detail.members
            };
            entry.item.unsealedDetail = null;
            yield this.unsealChannelDetail(cardId, id, entry.item);
            if (this.focus) {
              const { dataType, data: data2, enableImage, enableAudio, enableVideo, enableBinary, members, created } = detail;
              const sealed = dataType === "sealed";
              const channelData = sealed ? entry.item.unsealedDetail : data2;
              const focusDetail = {
                sealed,
                locked: sealed && (!this.seal || !entry.item.channelKey),
                dataType,
                data: this.parse(channelData),
                enableImage,
                enableAudio,
                enableVideo,
                enableBinary,
                created,
                members: members.map((guid2) => ({ guid: guid2 }))
              };
              this.focus.setDetail(cardId, id, focusDetail);
            }
            entry.channel = this.setChannel(cardId, id, entry.item);
            yield this.store.setContactCardChannelDetail(guid, cardId, id, entry.item.detail, entry.item.unsealedDetail);
          }
          if (topicRevision !== entry.item.summary.revision) {
            const summary = channelSummary ? channelSummary : yield getContactChannelSummary(server, !insecure, card.guid, card.token, id);
            entry.item.summary = {
              revision: topicRevision,
              sealed: summary.lastTopic.dataType === "sealedtopic",
              guid: summary.lastTopic.guid,
              dataType: summary.lastTopic.dataType,
              data: summary.lastTopic.data,
              created: summary.lastTopic.created,
              updated: summary.lastTopic.updated,
              status: summary.lastTopic.status,
              transform: summary.lastTopic.transform
            };
            entry.item.unsealedSummary = null;
            yield this.unsealChannelSummary(cardId, id, entry.item);
            if (this.hasSynced) {
              yield this.markChannelUnread(cardId, id, topicRevision);
            } else {
              yield this.markChannelRead(cardId, id, topicRevision);
            }
            entry.channel = this.setChannel(cardId, id, entry.item);
            yield this.store.setContactCardChannelSummary(guid, cardId, id, entry.item.summary, entry.item.unsealedSummary);
            if (this.focus) {
              yield this.focus.setRevision(cardId, id, topicRevision);
            }
          }
        }
      }
    });
  }
  addCardListener(ev) {
    this.emitter.on("card", ev);
    const cards = Array.from(this.cardEntries, ([cardId, entry]) => entry.card);
    ev(cards);
  }
  removeCardListener(ev) {
    this.emitter.off("card", ev);
  }
  emitCards() {
    const cards = Array.from(this.cardEntries, ([cardId, entry]) => entry.card);
    this.emitter.emit("card", cards);
  }
  addArticleListener(id, ev) {
    if (id) {
      const cardId = id;
      this.emitter.on(`article::${cardId}`, ev);
      const entries = this.articleEntries.get(cardId);
      const articles = entries ? Array.from(entries, ([articleId, entry]) => entry.article) : [];
      ev({ cardId, articles });
    } else {
      this.emitter.on("article", ev);
      this.articleEntries.forEach((entries, cardId) => {
        const articles = Array.from(entries, ([articleId, entry]) => entry.article);
        ev({ cardId, articles });
      });
    }
  }
  removeArticleListener(id, ev) {
    if (id) {
      const cardId = id;
      this.emitter.off(`article::${cardId}`, ev);
    } else {
      this.emitter.off("article", ev);
    }
  }
  emitArticles(cardId) {
    const entries = this.articleEntries.get(cardId);
    const articles = entries ? Array.from(entries, ([articleId, entry]) => entry.article) : [];
    this.emitter.emit("article", { cardId, articles });
    this.emitter.emit(`article::${cardId}`, { cardId, articles });
  }
  addChannelListener(ev) {
    this.emitter.on("channel", ev);
    this.channelEntries.forEach((entries, cardId) => {
      const channels = Array.from(entries, ([channelId, entry]) => entry.channel);
      ev({ cardId, channels });
    });
  }
  removeChannelListener(ev) {
    this.emitter.off("channel", ev);
  }
  emitChannels(cardId) {
    const entries = this.channelEntries.get(cardId);
    const channels = entries ? Array.from(entries, ([channelId, entry]) => entry.channel) : [];
    this.emitter.emit("channel", { cardId, channels });
  }
  addLoadedListener(ev) {
    this.emitter.on("loaded", ev);
    ev(this.loaded);
  }
  removeLoadedListener(ev) {
    this.emitter.off("loaded", ev);
  }
  emitLoaded() {
    if (!this.loaded) {
      this.loaded = Boolean(this.revision);
      this.emitter.emit("loaded", this.loaded);
    }
  }
  setFocus(cardId, channelId) {
    return __async(this, null, function* () {
      if (this.focus) {
        this.focus.close();
      }
      const markRead = () => __async(this, null, function* () {
        try {
          yield this.setUnreadChannel(cardId, channelId, false);
        } catch (err) {
          this.log.error(err);
        }
      });
      const flagTopic = (topicId) => __async(this, null, function* () {
        const entry = this.cardEntries.get(cardId);
        if (entry) {
          const server = entry.item.profile.node ? entry.item.profile.node : this.node;
          const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
          yield addFlag(server, !insecure, entry.item.profile.guid, { channelId, topicId });
        }
      });
      const cardEntry = this.cardEntries.get(cardId);
      const channelsEntry = this.channelEntries.get(cardId);
      const channelEntry = channelsEntry == null ? void 0 : channelsEntry.get(channelId);
      if (cardEntry && channelEntry) {
        const node = cardEntry.item.profile.node ? cardEntry.item.profile.node : this.node;
        const guid = cardEntry.item.profile.guid;
        const token = cardEntry.item.detail.token;
        if (!token) {
          throw new Error("card has no access token");
        }
        const revision = channelEntry.item.summary.revision;
        const channelKey = yield this.setChannelKey(channelEntry.item);
        const sealEnabled = Boolean(this.seal);
        const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(node);
        this.focus = new FocusModule(this.log, this.store, this.crypto, this.staging, cardId, channelId, this.guid, { node, secure: !insecure, token: `${guid}.${token}` }, channelKey, sealEnabled, revision, markRead, flagTopic);
        const { dataType, data, enableImage, enableAudio, enableVideo, enableBinary, members, created } = channelEntry.item.detail;
        const sealed = dataType === "sealed";
        const channelData = sealed ? channelEntry.item.unsealedDetail : data;
        const focusDetail = {
          sealed,
          locked: sealed && (!this.seal || !channelEntry.item.channelKey),
          dataType,
          data: this.parse(channelData),
          enableImage,
          enableAudio,
          enableVideo,
          enableBinary,
          created,
          members: members.map((guid2) => ({ guid: guid2 }))
        };
        this.focus.setDetail(cardId, channelId, focusDetail);
      } else {
        this.focus = new FocusModule(this.log, this.store, this.crypto, this.staging, null, channelId, this.guid, null, null, false, 0, markRead, flagTopic);
      }
      return this.focus;
    });
  }
  clearFocus() {
    if (this.focus) {
      this.focus.close();
      this.focus = null;
    }
  }
  addCard(server, guid) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const insecure = server ? /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server) : false;
      const message = server ? yield getContactListing(server, !insecure, guid) : yield getContactListing(node, secure, guid);
      const added = yield addCard(node, secure, token, message);
      return added.id;
    });
  }
  removeCard(cardId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield removeCard(node, secure, token, cardId);
    });
  }
  confirmCard(cardId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setCardConfirmed(node, secure, token, cardId);
    });
  }
  connectCard(cardId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setCardConnecting(node, secure, token, cardId);
      try {
        const message = yield getCardOpenMessage(node, secure, token, cardId);
        const entry = this.cardEntries.get(cardId);
        if (entry) {
          const server = entry.item.profile.node ? entry.item.profile.node : node;
          const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
          const contact = yield setCardOpenMessage(server, !insecure, message);
          if (contact.status === "connected") {
            const { token: contactToken, articleRevision, channelRevision, profileRevision } = contact;
            yield setCardConnected(node, secure, token, cardId, contactToken, articleRevision, channelRevision, profileRevision);
          }
        }
      } catch (err) {
        this.log.error("failed to deliver open message");
      }
    });
  }
  addAndConnectCard(server, guid) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const insecure = server ? /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server) : false;
      const message = server ? yield getContactListing(server, !insecure, guid) : yield getContactListing(node, secure, guid);
      const added = yield addCard(node, secure, token, message);
      yield setCardConnecting(node, secure, token, added.id);
      try {
        const message2 = yield getCardOpenMessage(node, secure, token, added.id);
        const server2 = added.data.cardProfile.node ? added.data.cardProfile.node : node;
        const insecure2 = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server2);
        const contact = yield setCardOpenMessage(server2, !insecure2, message2);
        if (contact.status === "connected") {
          const { token: contactToken, articleRevision, channelRevision, profileRevision } = contact;
          yield setCardConnected(node, secure, token, added.id, contactToken, articleRevision, channelRevision, profileRevision);
        }
      } catch (err) {
        this.log.error("failed to deliver open message");
      }
    });
  }
  disconnectCard(cardId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setCardConfirmed(node, secure, token, cardId);
      try {
        const message = yield getCardCloseMessage(node, secure, token, cardId);
        const entry = this.cardEntries.get(cardId);
        if (entry) {
          const server = entry.item.profile.node ? entry.item.profile.node : node;
          const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
          yield setCardCloseMessage(server, !insecure, message);
        }
      } catch (err) {
        this.log.warn("failed to deliver close message");
      }
    });
  }
  denyCard(cardId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const entry = this.cardEntries.get(cardId);
      if (entry) {
        try {
          const message = yield getCardCloseMessage(node, secure, token, cardId);
          const server = entry.item.profile.node ? entry.item.profile.node : node;
          const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
          yield setCardCloseMessage(server, !insecure, message);
        } catch (err) {
          this.log.warn("failed to deliver close message");
        }
        if (entry.item.detail.status === "pending") {
          yield removeCard(node, secure, token, cardId);
        } else {
          yield setCardConfirmed(node, secure, token, cardId);
        }
      }
    });
  }
  ignoreCard(cardId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const entry = this.cardEntries.get(cardId);
      if (entry) {
        if (entry.item.detail.status === "pending") {
          yield removeCard(node, secure, token, cardId);
        } else {
          yield setCardConfirmed(node, secure, token, cardId);
        }
      }
    });
  }
  removeArticle(cardId, articleId) {
    return __async(this, null, function* () {
    });
  }
  leaveChannel(cardId, channelId) {
    return __async(this, null, function* () {
      const entry = this.cardEntries.get(cardId);
      if (entry) {
        const server = entry.item.profile.node ? entry.item.profile.node : this.node;
        const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
        yield removeContactChannel(server, !insecure, entry.item.profile.guid, entry.item.detail.token, channelId);
        yield this.store.removeContactCardChannel(entry.item.profile.guid, cardId, channelId);
      }
    });
  }
  callCard(cardId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const entry = this.cardEntries.get(cardId);
      if (!entry || entry.item.detail.status !== "connected") {
        throw new Error("invalid card for call");
      }
      const { profile, detail } = entry.item;
      const link = new LinkModule(this.log);
      const server = profile.node ? profile.node : this.node;
      const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
      yield link.call(node, secure, token, cardId, server, !insecure, profile.guid, detail.token);
      return link;
    });
  }
  // added to allow ring to end call (deprecate)
  endCall(cardId, callId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const entry = this.cardEntries.get(cardId);
      if (!entry || entry.item.detail.status !== "connected") {
        throw new Error("invalid card for call");
      }
      const { profile, detail } = entry.item;
      const server = profile.node ? profile.node : this.node;
      const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
      yield removeContactCall(server, !insecure, profile.guid, detail.token, callId);
    });
  }
  getCardToken(cardId) {
    const entry = this.cardEntries.get(cardId);
    if (!entry || entry.item.detail.status !== "connected") {
      throw new Error("invalid card for call");
    }
    const { profile, detail } = entry.item;
    return detail.token;
  }
  setBlockedCard(cardId, blocked) {
    return __async(this, null, function* () {
      const entry = this.cardEntries.get(cardId);
      if (entry) {
        if (blocked) {
          yield this.setCardBlocked(cardId);
        } else {
          yield this.clearCardBlocked(cardId);
        }
        entry.card = this.setCard(cardId, entry.item);
        this.emitCards();
      }
    });
  }
  setBlockedChannel(cardId, channelId, blocked) {
    return __async(this, null, function* () {
      const entries = this.channelEntries.get(cardId);
      if (entries) {
        const entry = entries.get(channelId);
        if (entry) {
          if (blocked) {
            yield this.setChannelBlocked(cardId, channelId);
          } else {
            yield this.clearChannelBlocked(cardId, channelId);
          }
          entry.channel = this.setChannel(cardId, channelId, entry.item);
          this.emitChannels(cardId);
        }
      }
    });
  }
  getBlockedChannels() {
    return __async(this, null, function* () {
      const channels = [];
      this.channelEntries.forEach((card, cardId) => {
        card.forEach((entry, channelId) => {
          if (this.isChannelBlocked(cardId, channelId)) {
            channels.push(entry.channel);
          }
        });
      });
      return channels;
    });
  }
  clearBlockedChannelTopic(cardId, channelId, topicId) {
    return __async(this, null, function* () {
      const { guid } = this;
      const id = `${cardId}:${channelId}:${topicId}`;
      yield this.store.clearMarker(guid, "blocked_topic", id);
      if (this.focus) {
        yield this.focus.clearBlockedChannelTopic(cardId, channelId, topicId);
      }
    });
  }
  setBlockedArticle(cardId, articleId, blocked) {
    return __async(this, null, function* () {
      const entries = this.articleEntries.get(cardId);
      if (entries) {
        const entry = entries.get(articleId);
        if (entry) {
          if (blocked) {
            yield this.setArticleBlocked(cardId, articleId);
          } else {
            yield this.clearArticleBlocked(cardId, articleId);
          }
          entry.article = this.setArticle(cardId, articleId, entry.item);
          this.emitArticles(cardId);
        }
      }
    });
  }
  flagCard(cardId) {
    return __async(this, null, function* () {
      const entry = this.cardEntries.get(cardId);
      if (entry) {
        const server = entry.item.profile.node ? entry.item.profile.node : this.node;
        const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
        yield addFlag(server, !insecure, entry.item.profile.guid, {});
      }
    });
  }
  flagArticle(cardId, articleId) {
    return __async(this, null, function* () {
      const entry = this.cardEntries.get(cardId);
      if (entry) {
        const server = entry.item.profile.node ? entry.item.profile.node : this.node;
        const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
        yield addFlag(server, !insecure, entry.item.profile.guid, { articleId });
      }
    });
  }
  flagChannel(cardId, channelId) {
    return __async(this, null, function* () {
      const entry = this.cardEntries.get(cardId);
      if (entry) {
        const server = entry.item.profile.node ? entry.item.profile.node : this.node;
        const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
        yield addFlag(server, !insecure, entry.item.profile.guid, { channelId });
      }
    });
  }
  setUnreadChannel(cardId, channelId, unread) {
    return __async(this, null, function* () {
      const channelsEntry = this.channelEntries.get(cardId);
      if (!channelsEntry) {
        throw new Error("card not found");
      }
      const channelEntry = channelsEntry.get(channelId);
      if (!channelEntry) {
        throw new Error("channel not found");
      }
      const id = `${cardId}:${channelId}`;
      if (unread) {
        this.read.delete(id);
        channelEntry.channel = this.setChannel(cardId, channelId, channelEntry.item);
        this.emitChannels(cardId);
        yield this.store.clearMarker(this.guid, "read_card_channel", id);
      } else {
        const revision = channelEntry.item.summary.revision;
        this.read.set(id, revision);
        channelEntry.channel = this.setChannel(cardId, channelId, channelEntry.item);
        this.emitChannels(cardId);
        yield this.store.setMarker(this.guid, "read_card_channel", id, revision.toString());
      }
    });
  }
  getChannelNotifications(cardId, channelId) {
    return __async(this, null, function* () {
      const entry = this.cardEntries.get(cardId);
      if (entry) {
        const server = entry.item.profile.node ? entry.item.profile.node : this.node;
        const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
        return yield getContactChannelNotifications(server, !insecure, entry.item.profile.guid, entry.item.detail.token, channelId);
      }
      return false;
    });
  }
  setChannelNotifications(cardId, channelId, enabled) {
    return __async(this, null, function* () {
      const entry = this.cardEntries.get(cardId);
      if (entry) {
        const server = entry.item.profile.node ? entry.item.profile.node : this.node;
        const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
        yield setContactChannelNotifications(server, !insecure, entry.item.profile.guid, entry.item.detail.token, channelId, enabled);
      }
    });
  }
  getRegistry(handle, server) {
    return __async(this, null, function* () {
      const { node, secure } = this;
      const insecure = server ? /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server) : false;
      const listing = server ? yield getRegistryListing(handle, server, !insecure) : yield getRegistryListing(handle, node, secure);
      return listing.map((entity) => {
        return {
          guid: entity.guid,
          handle: entity.handle,
          name: entity.name,
          description: entity.description,
          location: entity.location,
          node: entity.node,
          version: entity.version,
          sealSet: Boolean(entity.seal),
          imageUrl: entity.imageSet ? server ? getRegistryImageUrl(server, true, entity.guid) : getRegistryImageUrl(node, secure, entity.guid) : avatar,
          imageSet: entity.imageSet
        };
      });
    });
  }
  setCard(cardId, item) {
    const { node, secure, token } = this;
    const { profile, detail } = item;
    const offsyncProfile = this.getCardProfileOffsync(cardId);
    const offsyncArticle = this.getCardArticleOffsync(cardId);
    const offsyncChannel = this.getCardChannelOffsync(cardId);
    return {
      cardId,
      offsync: Boolean(offsyncProfile || offsyncChannel || offsyncArticle),
      blocked: this.isCardBlocked(cardId),
      sealable: Boolean(item.profile.seal),
      status: detail.status,
      statusUpdated: detail.statusUpdated,
      guid: profile.guid,
      handle: profile.handle,
      name: profile.name,
      description: profile.description,
      location: profile.location,
      imageUrl: profile.imageSet ? getCardImageUrl(node, secure, token, cardId, item.profile.revision) : avatar,
      imageSet: profile.imageSet,
      node: profile.node,
      version: profile.version
    };
  }
  setArticle(cardId, articleId, item) {
    const { detail } = item;
    const articleData = detail.sealed ? item.unsealedDetail : detail.data;
    return {
      cardId,
      articleId,
      sealed: detail.sealed,
      blocked: this.isArticleBlocked(cardId, articleId),
      dataType: detail.dataType,
      data: articleData,
      created: detail.created,
      updated: detail.updated
    };
  }
  setChannel(cardId, channelId, item) {
    const { summary, detail } = item;
    const channelData = detail.sealed ? item.unsealedDetail : detail.data || "{}";
    const topicData = summary.sealed ? item.unsealedSummary : summary.data || "{}";
    const parsed = this.parse(topicData);
    const data = summary.sealed ? parsed == null ? void 0 : parsed.message : parsed;
    return {
      channelId,
      cardId,
      lastTopic: {
        guid: summary.guid,
        sealed: summary.sealed,
        dataType: summary.dataType,
        data: getLegacyData(data).data,
        created: summary.created,
        updated: summary.updated,
        status: summary.status,
        transform: summary.transform
      },
      blocked: this.isChannelBlocked(cardId, channelId),
      unread: this.isChannelUnread(cardId, channelId, summary.revision),
      sealed: detail.sealed,
      locked: detail.sealed && (!this.seal || !item.channelKey),
      dataType: detail.dataType,
      data: this.parse(channelData),
      created: detail.created,
      updated: detail.updated,
      enableImage: detail.enableImage,
      enableAudio: detail.enableAudio,
      enableVideo: detail.enableVideo,
      enableBinary: detail.enableBinary,
      members: detail.members.map((guid) => ({ guid }))
    };
  }
  setSeal(seal) {
    return __async(this, null, function* () {
      this.seal = seal;
      if (this.focus) {
        yield this.focus.setSealEnabled(Boolean(this.seal));
      }
      this.unsealAll = true;
      yield this.sync();
    });
  }
  getSeal(cardId, keyData) {
    return __async(this, null, function* () {
      if (!this.crypto) {
        throw new Error("crypto not set");
      }
      const card = this.cardEntries.get(cardId);
      if (!card) {
        throw new Error("specified card not found");
      }
      const publicKey = card.item.profile.seal;
      if (!publicKey) {
        throw new Error("seal key not set for card");
      }
      const sealed = yield this.crypto.rsaEncrypt(keyData, publicKey);
      const sealedKey = sealed.encryptedDataB64;
      return { publicKey, sealedKey };
    });
  }
  getChannelKey(seals) {
    return __async(this, null, function* () {
      if (seals) {
        const seal = seals.find(({ publicKey }) => this.seal && publicKey === this.seal.publicKey);
        if (seal && this.crypto && this.seal) {
          const key = yield this.crypto.rsaDecrypt(seal.sealedKey, this.seal.privateKey);
          return key.data;
        }
      }
      return null;
    });
  }
  setChannelKey(item) {
    return __async(this, null, function* () {
      if (!item.channelKey && item.detail.dataType === "sealed" && this.seal && this.crypto) {
        try {
          const { seals } = JSON.parse(item.detail.data);
          item.channelKey = yield this.getChannelKey(seals);
        } catch (err) {
          this.log.warn(err);
        }
      }
      return item.channelKey;
    });
  }
  unsealChannelDetail(cardId, channelId, item) {
    return __async(this, null, function* () {
      if (item.unsealedDetail == null && item.detail.dataType === "sealed" && this.seal && this.crypto) {
        try {
          const { subjectEncrypted, subjectIv, seals } = JSON.parse(item.detail.data);
          if (!item.channelKey) {
            item.channelKey = yield this.getChannelKey(seals);
            if (this.focus) {
              try {
                yield this.focus.setChannelKey(cardId, channelId, item.channelKey);
              } catch (err) {
                this.log.warn(err);
              }
            }
          }
          if (item.channelKey) {
            const { data } = yield this.crypto.aesDecrypt(subjectEncrypted, subjectIv, item.channelKey);
            item.unsealedDetail = data;
            if (this.focus) {
              const { dataType, enableImage, enableAudio, enableVideo, enableBinary, members, created } = item.detail;
              const focusDetail = {
                sealed: true,
                locked: false,
                dataType,
                data: this.parse(data),
                enableImage,
                enableAudio,
                enableVideo,
                enableBinary,
                created,
                members: members.map((guid) => ({ guid }))
              };
              this.focus.setDetail(cardId, channelId, focusDetail);
            }
            return true;
          }
        } catch (err) {
          this.log.warn(err);
        }
      }
      return false;
    });
  }
  unsealChannelSummary(cardId, channelId, item) {
    return __async(this, null, function* () {
      if (item.unsealedSummary == null && item.summary.dataType === "sealedtopic" && this.seal && this.crypto) {
        try {
          if (!item.channelKey) {
            const { seals } = JSON.parse(item.detail.data);
            item.channelKey = yield this.getChannelKey(seals);
            if (this.focus) {
              try {
                yield this.focus.setChannelKey(cardId, channelId, item.channelKey);
              } catch (err) {
                this.log.warn(err);
              }
            }
          }
          if (item.channelKey) {
            const { messageEncrypted, messageIv } = JSON.parse(item.summary.data);
            if (!messageEncrypted || !messageIv) {
              this.log.warn("invalid sealed summary");
            } else {
              const { data } = yield this.crypto.aesDecrypt(messageEncrypted, messageIv, item.channelKey);
              item.unsealedSummary = data;
              return true;
            }
          }
        } catch (err) {
          this.log.warn(err);
        }
      }
      return false;
    });
  }
  getCardEntry(cardId) {
    return __async(this, null, function* () {
      const { guid } = this;
      const entry = this.cardEntries.get(cardId);
      if (entry) {
        return entry;
      }
      const item = JSON.parse(JSON.stringify(defaultCardItem));
      const card = this.setCard(cardId, item);
      const cardEntry = { item, card };
      this.cardEntries.set(cardId, cardEntry);
      yield this.store.addContactCard(guid, cardId, item);
      return cardEntry;
    });
  }
  getChannelEntries(cardId) {
    const entries = this.channelEntries.get(cardId);
    if (entries) {
      return entries;
    }
    const channels = /* @__PURE__ */ new Map();
    this.channelEntries.set(cardId, channels);
    return channels;
  }
  getChannelEntry(channels, cardId, channelId) {
    return __async(this, null, function* () {
      const { guid } = this;
      const entry = channels.get(channelId);
      if (entry) {
        return entry;
      }
      const item = JSON.parse(JSON.stringify(defaultChannelItem));
      const channel = this.setChannel(cardId, channelId, item);
      const channelEntry = { item, channel };
      channels.set(channelId, channelEntry);
      yield this.store.addContactCardChannel(guid, cardId, channelId, item);
      return channelEntry;
    });
  }
  parse(data) {
    if (data) {
      try {
        if (data == null) {
          return null;
        }
        return JSON.parse(data);
      } catch (err) {
        this.log.error("invalid contact data");
      }
    }
    return {};
  }
};

// src/alias.ts
import { EventEmitter as EventEmitter5 } from "eventemitter3";
var AliasModule = class {
  constructor(log, settings, store, guid, token, node, secure) {
    this.guid = guid;
    this.token = token;
    this.node = node;
    this.secure = secure;
    this.log = log;
    this.settings = settings;
    this.emitter = new EventEmitter5();
  }
  addGroupListener(ev) {
    this.emitter.on("group", ev);
  }
  removeGroupListener(ev) {
    this.emitter.off("group", ev);
  }
  close() {
    return __async(this, null, function* () {
    });
  }
  setRevision(rev) {
    return __async(this, null, function* () {
      console.log("set alias revision:", rev);
    });
  }
  addGroup(sealed, dataType, subject, cardIds) {
    return __async(this, null, function* () {
      return "";
    });
  }
  removeGroup(groupId) {
    return __async(this, null, function* () {
    });
  }
  setGroupSubject(groupId, subject) {
    return __async(this, null, function* () {
    });
  }
  setGroupCard(groupId, cardId) {
    return __async(this, null, function* () {
    });
  }
  clearGroupCard(groupId, cardId) {
    return __async(this, null, function* () {
    });
  }
  compare(groupIds, cardIds) {
    return __async(this, null, function* () {
      return /* @__PURE__ */ new Map();
    });
  }
};

// src/attribute.ts
import { EventEmitter as EventEmitter6 } from "eventemitter3";
var AttributeModule = class {
  constructor(log, settings, store, guid, token, node, secure) {
    this.guid = guid;
    this.token = token;
    this.node = node;
    this.secure = secure;
    this.log = log;
    this.settings = settings;
    this.emitter = new EventEmitter6();
  }
  addCardListener(ev) {
    this.emitter.on("artcile", ev);
  }
  removeCardListener(ev) {
    this.emitter.off("article", ev);
  }
  close() {
    return __async(this, null, function* () {
    });
  }
  setRevision(rev) {
    return __async(this, null, function* () {
      console.log("set attribute revision:", rev);
    });
  }
  addArticle(sealed, type, subject, cardIds, groupIds) {
    return __async(this, null, function* () {
      return "";
    });
  }
  removeArticle(articleId) {
    return __async(this, null, function* () {
    });
  }
  setArticleSubject(articleId, subject) {
    return __async(this, null, function* () {
    });
  }
  setArticleCard(articleId, cardId) {
    return __async(this, null, function* () {
    });
  }
  clearArticleCard(articleId, cardId) {
    return __async(this, null, function* () {
    });
  }
  setArticleGroup(articleId, groupId) {
    return __async(this, null, function* () {
    });
  }
  clearArticleGroup(articleId, groupId) {
    return __async(this, null, function* () {
    });
  }
  addArticleListener(ev) {
  }
  removeArticleListener(ev) {
  }
};

// src/content.ts
import { EventEmitter as EventEmitter7 } from "eventemitter3";
var ContentModule = class {
  constructor(log, crypto, contact, stream) {
    this.contact = contact;
    this.stream = stream;
    this.log = log;
    this.crypto = crypto;
    this.emitter = new EventEmitter7();
    this.streamLoaded = false;
    this.contactLoaded = false;
    this.stream.addLoadedListener((loaded) => {
      this.streamLoaded = loaded;
      this.emitLoaded();
    });
    this.contact.addLoadedListener((loaded) => {
      this.contactLoaded = loaded;
      this.emitLoaded();
    });
  }
  addChannel(sealed, type, subject, cardIds) {
    return __async(this, null, function* () {
      if (sealed) {
        if (!this.crypto) {
          throw new Error("crypto not set");
        }
        const { aesKeyHex } = yield this.crypto.aesKey();
        const seals = [];
        for (let cardId of cardIds) {
          const seal = yield this.contact.getSeal(cardId, aesKeyHex);
          seals.push(seal);
        }
        return yield this.stream.addSealedChannel(type, subject, cardIds, aesKeyHex, seals);
      } else {
        return yield this.stream.addUnsealedChannel(type, subject, cardIds);
      }
    });
  }
  removeChannel(channelId) {
    return __async(this, null, function* () {
      return yield this.stream.removeChannel(channelId);
    });
  }
  setChannelSubject(channelId, type, subject) {
    return __async(this, null, function* () {
      return yield this.stream.setChannelSubject(channelId, type, subject);
    });
  }
  setChannelCard(channelId, cardId) {
    return __async(this, null, function* () {
      const getSeal = (aesKey) => __async(this, null, function* () {
        return yield this.contact.getSeal(cardId, aesKey);
      });
      return yield this.stream.setChannelCard(channelId, cardId, getSeal);
    });
  }
  clearChannelCard(channelId, cardId) {
    return __async(this, null, function* () {
      return yield this.stream.clearChannelCard(channelId, cardId);
    });
  }
  leaveChannel(cardId, channelId) {
    return __async(this, null, function* () {
      return yield this.contact.leaveChannel(cardId, channelId);
    });
  }
  getChannelNotifications(cardId, channelId) {
    return __async(this, null, function* () {
      if (cardId) {
        return yield this.contact.getChannelNotifications(cardId, channelId);
      }
      return yield this.stream.getChannelNotifications(channelId);
    });
  }
  setChannelNotifications(cardId, channelId, enabled) {
    return __async(this, null, function* () {
      if (cardId) {
        return yield this.contact.setChannelNotifications(cardId, channelId, enabled);
      }
      return yield this.stream.setChannelNotifications(channelId, enabled);
    });
  }
  setUnreadChannel(cardId, channelId, unread) {
    return __async(this, null, function* () {
      if (cardId) {
        return yield this.contact.setUnreadChannel(cardId, channelId, unread);
      }
      return yield this.stream.setUnreadChannel(channelId, unread);
    });
  }
  flagChannel(cardId, channelId) {
    return __async(this, null, function* () {
      if (cardId) {
        return yield this.contact.flagChannel(cardId, channelId);
      }
      return yield this.stream.flagChannel(channelId);
    });
  }
  setBlockedChannel(cardId, channelId, blocked) {
    return __async(this, null, function* () {
      if (cardId) {
        return yield this.contact.setBlockedChannel(cardId, channelId, blocked);
      }
      return yield this.stream.setBlockedChannel(channelId, blocked);
    });
  }
  getBlockedChannels() {
    return __async(this, null, function* () {
      const channels = yield this.stream.getBlockedChannels();
      const cardChannels = yield this.contact.getBlockedChannels();
      return channels.concat(cardChannels);
    });
  }
  clearBlockedChannelTopic(cardId, channelId, topicId) {
    return __async(this, null, function* () {
      if (cardId) {
        return yield this.contact.clearBlockedChannelTopic(cardId, channelId, topicId);
      }
      return yield this.stream.clearBlockedChannelTopic(channelId, topicId);
    });
  }
  addChannelListener(ev) {
    this.stream.addChannelListener(ev);
    this.contact.addChannelListener(ev);
  }
  removeChannelListener(ev) {
    this.stream.removeChannelListener(ev);
    this.contact.removeChannelListener(ev);
  }
  addLoadedListener(ev) {
    this.emitter.on("loaded", ev);
    ev(this.streamLoaded && this.contactLoaded);
  }
  removeLoadedListener(ev) {
    this.emitter.off("loaded", ev);
  }
  emitLoaded() {
    if (this.streamLoaded && this.contactLoaded) {
      this.emitter.emit("loaded", true);
    }
  }
};

// src/stream.ts
import { EventEmitter as EventEmitter8 } from "eventemitter3";

// src/net/addChannel.ts
function addChannel(node, secure, token, type, data, cards) {
  return __async(this, null, function* () {
    const params = { dataType: type, data: JSON.stringify(data), groups: [], cards };
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels?agent=${token}`;
    const channel = yield fetchWithTimeout(endpoint, {
      method: "POST",
      body: JSON.stringify(params)
    });
    checkResponse(channel.status);
    return yield channel.json();
  });
}

// src/net/removeChannel.ts
function removeChannel(node, secure, token, channelId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(status);
  });
}

// src/net/getChannels.ts
function getChannels(node, secure, token, revision, types) {
  return __async(this, null, function* () {
    const params = (revision ? `&channelRevision=${revision}` : "") + `&types=${encodeURIComponent(JSON.stringify(types))}`;
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels?agent=${token}${params}`;
    const channels = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(channels.status);
    return yield channels.json();
  });
}

// src/net/getChannelDetail.ts
function getChannelDetail(node, secure, token, channelId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/detail?agent=${token}`;
    const detail = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(detail.status);
    return yield detail.json();
  });
}

// src/net/getChannelSummary.ts
function getChannelSummary(node, secure, token, channelId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/summary?agent=${token}`;
    const summary = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(summary.status);
    return yield summary.json();
  });
}

// src/net/setChannelSubject.ts
function setChannelSubject(node, secure, token, channelId, type, data) {
  return __async(this, null, function* () {
    const params = { dataType: type, data: JSON.stringify(data) };
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/subject?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      body: JSON.stringify(params)
    });
    checkResponse(status);
  });
}

// src/net/setChannelCard.ts
function setChannelCard(node, secure, token, channelId, cardId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/cards/${cardId}?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "PUT" });
    checkResponse(status);
  });
}

// src/net/clearChannelCard.ts
function clearChannelCard(node, secure, token, channelId, cardId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/cards/${cardId}?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(status);
  });
}

// src/net/getChannelNotifications.ts
function getChannelNotifications(node, secure, token, channelId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/notification?agent=${token}`;
    const notify = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(notify.status);
    return yield notify.json();
  });
}

// src/net/setChannelNotifications.ts
function setChannelNotifications(node, secure, token, channelId, notify) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/content/channels/${channelId}/notification?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "PUT", body: JSON.stringify(notify) });
    checkResponse(status);
  });
}

// src/stream.ts
var CLOSE_POLL_MS6 = 100;
var RETRY_POLL_MS5 = 2e3;
var StreamModule = class {
  constructor(log, store, crypto, staging, guid, token, node, secure, channelTypes) {
    this.guid = guid;
    this.token = token;
    this.node = node;
    this.secure = secure;
    this.log = log;
    this.store = store;
    this.crypto = crypto;
    this.staging = staging;
    this.focus = null;
    this.seal = null;
    this.unsealAll = false;
    this.loaded = false;
    this.channelTypes = channelTypes;
    this.emitter = new EventEmitter8();
    this.channelEntries = /* @__PURE__ */ new Map();
    this.read = /* @__PURE__ */ new Map();
    this.blocked = /* @__PURE__ */ new Set();
    this.revision = 0;
    this.syncing = true;
    this.closing = false;
    this.nextRevision = null;
    this.hasSynced = false;
    this.init();
  }
  init() {
    return __async(this, null, function* () {
      const { guid } = this;
      this.revision = yield this.store.getContentRevision(guid);
      const blockedMarkers = yield this.store.getMarkers(guid, "blocked_channel");
      blockedMarkers.forEach((marker) => {
        this.blocked.add(marker.id);
      });
      const readMarkers = yield this.store.getMarkers(guid, "read_channel");
      readMarkers.forEach((marker) => {
        this.read.set(marker.id, parseInt(marker.value));
      });
      const hasSyncedMarkers = yield this.store.getMarkers(guid, "first_sync_complete");
      this.hasSynced = hasSyncedMarkers.filter((marker) => marker.id === "stream").length !== 0;
      const channels = yield this.store.getContentChannels(guid);
      channels.forEach(({ channelId, item }) => {
        const channel = this.setChannel(channelId, item);
        this.channelEntries.set(channelId, { item, channel });
      });
      this.emitChannels();
      this.unsealAll = true;
      this.syncing = false;
      yield this.sync();
      this.emitLoaded();
    });
  }
  parse(data) {
    if (data) {
      try {
        if (data == null) {
          return null;
        }
        return JSON.parse(data);
      } catch (err) {
        this.log.warn("invalid channel data");
      }
    }
    return {};
  }
  sync() {
    return __async(this, null, function* () {
      if (!this.syncing) {
        this.syncing = true;
        const { guid, node, secure, token, channelTypes } = this;
        while ((this.unsealAll || this.nextRevision) && !this.closing) {
          if (this.nextRevision && this.revision !== this.nextRevision) {
            const nextRev = this.nextRevision;
            try {
              const delta = yield getChannels(node, secure, token, this.revision, channelTypes);
              for (const entity of delta) {
                const { id, revision, data } = entity;
                if (data) {
                  const { detailRevision, topicRevision, channelSummary, channelDetail } = data;
                  const entry = yield this.getChannelEntry(id);
                  if (detailRevision !== entry.item.detail.revision) {
                    const detail = channelDetail ? channelDetail : yield getChannelDetail(node, secure, token, id);
                    entry.item.detail = {
                      revision: detailRevision,
                      sealed: detail.dataType === "sealed",
                      dataType: detail.dataType,
                      data: detail.data,
                      created: detail.created,
                      updated: detail.updated,
                      enableImage: detail.enableImage,
                      enableAudio: detail.enableAudio,
                      enableVideo: detail.enableVideo,
                      enableBinary: detail.enableBinary,
                      contacts: detail.contacts,
                      members: detail.members
                    };
                    entry.item.unsealedDetail = null;
                    yield this.unsealChannelDetail(id, entry.item);
                    entry.channel = this.setChannel(id, entry.item);
                    if (this.focus) {
                      const { dataType, data: data2, enableImage, enableAudio, enableVideo, enableBinary, members, created } = detail;
                      const sealed = dataType === "sealed";
                      const channelData = sealed ? entry.item.unsealedDetail : data2;
                      const focusDetail = {
                        sealed,
                        locked: sealed && (!this.seal || !entry.item.channelKey),
                        dataType,
                        data: this.parse(channelData),
                        enableImage,
                        enableAudio,
                        enableVideo,
                        enableBinary,
                        created,
                        members: members.map((guid2) => ({ guid: guid2 }))
                      };
                      this.focus.setDetail(null, id, focusDetail);
                    }
                    yield this.store.setContentChannelDetail(guid, id, entry.item.detail, entry.item.unsealedDetail);
                  }
                  if (topicRevision !== entry.item.summary.revision) {
                    const summary = channelSummary ? channelSummary : yield getChannelSummary(node, secure, token, id);
                    entry.item.summary = {
                      revision: topicRevision,
                      sealed: summary.lastTopic.dataType === "sealedtopic",
                      guid: summary.lastTopic.guid,
                      dataType: summary.lastTopic.dataType,
                      data: summary.lastTopic.data,
                      created: summary.lastTopic.created,
                      updated: summary.lastTopic.updated,
                      status: summary.lastTopic.status,
                      transform: summary.lastTopic.transform
                    };
                    entry.item.unsealedSummary = null;
                    yield this.unsealChannelSummary(id, entry.item);
                    if (this.hasSynced) {
                      yield this.markChannelUnread(id, topicRevision);
                    } else {
                      yield this.markChannelRead(id, topicRevision);
                    }
                    entry.channel = this.setChannel(id, entry.item);
                    yield this.store.setContentChannelSummary(guid, id, entry.item.summary, entry.item.unsealedSummary);
                  }
                  if (this.focus) {
                    yield this.focus.setRevision(null, id, topicRevision);
                  }
                } else {
                  this.channelEntries.delete(id);
                  if (this.focus) {
                    this.focus.disconnect(null, id);
                  }
                  yield this.store.removeContentChannel(guid, id);
                }
              }
              this.emitChannels();
              yield this.store.setContentRevision(guid, nextRev);
              this.revision = nextRev;
              this.emitLoaded();
              if (this.nextRevision === nextRev) {
                this.nextRevision = null;
              }
              this.log.info(`content revision: ${nextRev}`);
            } catch (err) {
              this.log.warn(err);
              yield new Promise((r) => setTimeout(r, RETRY_POLL_MS5));
            }
          }
          if (this.revision === this.nextRevision) {
            this.nextRevision = null;
          }
          if (this.unsealAll) {
            for (const [channelId, entry] of this.channelEntries.entries()) {
              try {
                const { item } = entry;
                if (yield this.unsealChannelDetail(channelId, item)) {
                  yield this.store.setContentChannelUnsealedDetail(guid, channelId, item.unsealedDetail);
                }
                if (yield this.unsealChannelSummary(channelId, item)) {
                  yield this.store.setContentChannelUnsealedSummary(guid, channelId, item.unsealedSummary);
                }
                entry.channel = this.setChannel(channelId, item);
              } catch (err) {
                this.log.warn(err);
              }
            }
            this.unsealAll = false;
            this.emitChannels();
          }
        }
        if (this.revision && !this.hasSynced) {
          this.hasSynced = true;
          yield this.store.setMarker(this.guid, "first_sync_complete", "stream", "");
        }
        this.syncing = false;
      }
    });
  }
  addChannelListener(ev) {
    this.emitter.on("channel", ev);
    const channels = Array.from(this.channelEntries, ([channelId, entry]) => entry.channel);
    ev({ channels, cardId: null });
  }
  removeChannelListener(ev) {
    this.emitter.off("channel", ev);
  }
  emitChannels() {
    const channels = Array.from(this.channelEntries, ([channelId, entry]) => entry.channel);
    this.emitter.emit("channel", { channels, cardId: null });
  }
  addLoadedListener(ev) {
    this.emitter.on("loaded", ev);
    ev(this.loaded);
  }
  removeLoadedListener(ev) {
    this.emitter.off("loaded", ev);
  }
  emitLoaded() {
    if (!this.loaded) {
      this.loaded = Boolean(this.revision);
      this.emitter.emit("loaded", this.loaded);
    }
  }
  close() {
    return __async(this, null, function* () {
      this.closing = true;
      if (this.focus) {
        yield this.focus.close();
        this.focus = null;
      }
      while (this.syncing) {
        yield new Promise((r) => setTimeout(r, CLOSE_POLL_MS6));
      }
    });
  }
  setRevision(rev) {
    return __async(this, null, function* () {
      this.nextRevision = rev;
      yield this.sync();
      this.emitLoaded();
    });
  }
  addSealedChannel(type, subject, cardIds, aesKeyHex, seals) {
    return __async(this, null, function* () {
      const { node, secure, token, crypto, seal } = this;
      if (!crypto) {
        throw new Error("crypto not set");
      }
      if (!seal) {
        throw new Error("seal not set");
      }
      const sealKey = yield crypto.rsaEncrypt(aesKeyHex, seal.publicKey);
      const hostSeal = { publicKey: seal.publicKey, sealedKey: sealKey.encryptedDataB64 };
      const { ivHex } = yield crypto.aesIv();
      const subjectData = JSON.stringify(subject);
      const { encryptedDataB64 } = yield crypto.aesEncrypt(subjectData, ivHex, aesKeyHex);
      const sealedSubject = { subjectEncrypted: encryptedDataB64, subjectIv: ivHex, seals: [...seals, hostSeal] };
      return yield addChannel(node, secure, token, type, sealedSubject, cardIds);
    });
  }
  addUnsealedChannel(type, subject, cardIds) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      return yield addChannel(node, secure, token, type, subject, cardIds);
    });
  }
  removeChannel(channelId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      return yield removeChannel(node, secure, token, channelId);
    });
  }
  setChannelSubject(channelId, type, subject) {
    return __async(this, null, function* () {
      const channel = this.channelEntries.get(channelId);
      if (!channel) {
        throw new Error("channel not found");
      }
      const { item } = channel;
      const { node, secure, token, crypto, seal } = this;
      if (item.detail.sealed) {
        if (!crypto) {
          throw new Error("crypto not set");
        }
        if (!seal) {
          throw new Error("seal not set");
        }
        const { subjectIv, seals } = JSON.parse(item.detail.data);
        if (!item.channelKey) {
          item.channelKey = yield this.getChannelKey(seals);
        }
        if (!item.channelKey) {
          throw new Error("channel key not available");
        }
        const subjectData = JSON.stringify(subject);
        const { encryptedDataB64 } = yield crypto.aesEncrypt(subjectData, subjectIv, item.channelKey);
        const sealedSubject = { subjectEncrypted: encryptedDataB64, subjectIv, seals };
        yield setChannelSubject(node, secure, token, channelId, type, sealedSubject);
      } else {
        yield setChannelSubject(node, secure, token, channelId, type, subject);
      }
    });
  }
  setChannelCard(channelId, cardId, getSeal) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const channel = this.channelEntries.get(channelId);
      if (!channel) {
        throw new Error("channel not found");
      }
      if (channel.item.detail.sealed) {
        const channelKey = channel.item.channelKey;
        if (!channelKey) {
          throw new Error("cannot add members to locked channels");
        }
        const seal = yield getSeal(channelKey);
        const data = JSON.parse(channel.item.detail.data);
        const seals = [...data.seals, seal];
        const subject = __spreadProps(__spreadValues({}, data), { seals });
        yield setChannelSubject(node, secure, token, channelId, channel.item.detail.dataType, subject);
      }
      yield setChannelCard(node, secure, token, channelId, cardId);
    });
  }
  clearChannelCard(channelId, cardId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const channel = this.channelEntries.get(channelId);
      if (!channel) {
        throw new Error("channel not found");
      }
      yield clearChannelCard(node, secure, token, channelId, cardId);
    });
  }
  getBlockedChannels() {
    return __async(this, null, function* () {
      const channels = [];
      this.channelEntries.forEach((entry, channelId) => {
        if (this.isChannelBlocked(channelId)) {
          channels.push(entry.channel);
        }
      });
      return channels;
    });
  }
  setBlockedChannel(channelId, blocked) {
    return __async(this, null, function* () {
      const entry = this.channelEntries.get(channelId);
      if (entry) {
        if (blocked) {
          yield this.setChannelBlocked(channelId);
        } else {
          yield this.clearChannelBlocked(channelId);
        }
        entry.channel = this.setChannel(channelId, entry.item);
        this.emitChannels();
      }
    });
  }
  clearBlockedChannelTopic(channelId, topicId) {
    return __async(this, null, function* () {
      const { guid } = this;
      const id = `'':${channelId}:${topicId}`;
      yield this.store.clearMarker(guid, "blocked_topic", id);
      if (this.focus) {
        yield this.focus.clearBlockedChannelTopic(null, channelId, topicId);
      }
    });
  }
  flagChannel(channelId) {
    return __async(this, null, function* () {
      const { node, secure, guid } = this;
      yield addFlag(node, secure, guid, { channelId });
    });
  }
  getChannelNotifications(channelId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      return yield getChannelNotifications(node, secure, token, channelId);
    });
  }
  setChannelNotifications(channelId, enabled) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setChannelNotifications(node, secure, token, channelId, enabled);
    });
  }
  setUnreadChannel(channelId, unread) {
    return __async(this, null, function* () {
      const entry = this.channelEntries.get(channelId);
      if (!entry) {
        throw new Error("channel not found");
      }
      if (unread) {
        this.read.delete(channelId);
        entry.channel = this.setChannel(channelId, entry.item);
        this.emitChannels();
        yield this.store.clearMarker(this.guid, "read_channel", channelId);
      } else {
        const revision = entry.item.summary.revision;
        this.read.set(channelId, revision);
        entry.channel = this.setChannel(channelId, entry.item);
        this.emitChannels();
        yield this.store.setMarker(this.guid, "read_channel", channelId, revision.toString());
      }
    });
  }
  setFocus(channelId) {
    return __async(this, null, function* () {
      const { node, secure, token, focus } = this;
      if (focus) {
        focus.close();
      }
      const markRead = () => __async(this, null, function* () {
        try {
          yield this.setUnreadChannel(channelId, false);
        } catch (err) {
          this.log.error(err);
        }
      });
      const flagTopic = (topicId) => __async(this, null, function* () {
        const { node: node2, secure: secure2, guid } = this;
        yield addFlag(node2, secure2, guid, { channelId, topicId });
      });
      const entry = this.channelEntries.get(channelId);
      const channelKey = entry ? yield this.setChannelKey(entry.item) : null;
      const revision = entry ? entry.item.summary.revision : 0;
      const sealEnabled = Boolean(this.seal);
      this.focus = new FocusModule(this.log, this.store, this.crypto, this.staging, null, channelId, this.guid, { node, secure, token }, channelKey, sealEnabled, revision, markRead, flagTopic);
      if (entry) {
        const { dataType, data, enableImage, enableAudio, enableVideo, enableBinary, members, created } = entry.item.detail;
        const sealed = dataType === "sealed";
        const channelData = sealed ? entry.item.unsealedDetail : data;
        const focusDetail = {
          sealed,
          locked: sealed && (!this.seal || !entry.item.channelKey),
          dataType,
          data: this.parse(channelData),
          enableImage,
          enableAudio,
          enableVideo,
          enableBinary,
          created,
          members: members.map((guid) => ({ guid }))
        };
        this.focus.setDetail(null, channelId, focusDetail);
      }
      return this.focus;
    });
  }
  clearFocus() {
    if (this.focus) {
      this.focus.close();
      this.focus = null;
    }
  }
  setSeal(seal) {
    return __async(this, null, function* () {
      this.seal = seal;
      if (this.focus) {
        yield this.focus.setSealEnabled(Boolean(this.seal));
      }
      this.unsealAll = true;
      yield this.sync();
    });
  }
  getChannelKey(seals) {
    return __async(this, null, function* () {
      if (seals) {
        const seal = seals.find(({ publicKey }) => this.seal && publicKey === this.seal.publicKey);
        if (seal && this.crypto && this.seal) {
          const key = yield this.crypto.rsaDecrypt(seal.sealedKey, this.seal.privateKey);
          return key.data;
        }
      }
      return null;
    });
  }
  isChannelBlocked(channelId) {
    return this.blocked.has(channelId);
  }
  setChannelBlocked(channelId) {
    return __async(this, null, function* () {
      const entry = this.channelEntries.get(channelId);
      if (!entry) {
        throw new Error("channel not found");
      }
      this.blocked.add(channelId);
      entry.channel = this.setChannel(channelId, entry.item);
      this.emitChannels();
      const timestamp = Math.floor(Date.now() / 1e3);
      yield this.store.setMarker(this.guid, "blocked_channel", channelId, JSON.stringify({ cardId: null, channelId, timestamp }));
    });
  }
  clearChannelBlocked(channelId) {
    return __async(this, null, function* () {
      const entry = this.channelEntries.get(channelId);
      if (!entry) {
        throw new Error("channel not found");
      }
      this.blocked.delete(channelId);
      entry.channel = this.setChannel(channelId, entry.item);
      this.emitChannels();
      yield this.store.clearMarker(this.guid, "blocked_channel", channelId);
    });
  }
  isChannelUnread(channelId, revision) {
    if (this.read.has(channelId)) {
      const read = this.read.get(channelId);
      if (read && read >= revision) {
        return false;
      }
    }
    return true;
  }
  markChannelUnread(channelId, revision) {
    return __async(this, null, function* () {
      const read = this.read.get(channelId);
      if (!read || read < revision) {
        this.read.delete(channelId);
        yield this.store.clearMarker(this.guid, "read_channel", channelId);
      }
    });
  }
  markChannelRead(channelId, revision) {
    return __async(this, null, function* () {
      const read = this.read.get(channelId);
      if (!read || read < revision) {
        this.read.set(channelId, revision);
        yield this.store.setMarker(this.guid, "read_channel", channelId, revision.toString());
      }
    });
  }
  setChannel(channelId, item) {
    const { summary, detail, channelKey } = item;
    const channelData = detail.sealed ? item.unsealedDetail : detail.data || "{}";
    const topicData = summary.sealed ? item.unsealedSummary : summary.data || "{}";
    const parsed = this.parse(topicData);
    const data = summary.sealed ? parsed == null ? void 0 : parsed.message : parsed;
    return {
      channelId,
      cardId: null,
      lastTopic: {
        guid: summary.guid,
        sealed: summary.sealed,
        dataType: summary.dataType,
        data: getLegacyData(data).data,
        created: summary.created,
        updated: summary.updated,
        status: summary.status,
        transform: summary.transform
      },
      blocked: this.isChannelBlocked(channelId),
      unread: this.isChannelUnread(channelId, summary.revision),
      sealed: detail.sealed,
      locked: detail.sealed && (!this.seal || !channelKey),
      dataType: detail.dataType,
      data: this.parse(channelData),
      created: detail.created,
      updated: detail.updated,
      enableImage: detail.enableImage,
      enableAudio: detail.enableAudio,
      enableVideo: detail.enableVideo,
      enableBinary: detail.enableBinary,
      members: detail.members.map((guid) => ({ guid }))
    };
  }
  getChannelEntry(channelId) {
    return __async(this, null, function* () {
      const { guid } = this;
      const entry = this.channelEntries.get(channelId);
      if (entry) {
        return entry;
      }
      const item = JSON.parse(JSON.stringify(defaultChannelItem));
      const channel = this.setChannel(channelId, item);
      const channelEntry = { item, channel };
      this.channelEntries.set(channelId, channelEntry);
      yield this.store.addContentChannel(guid, channelId, item);
      return channelEntry;
    });
  }
  setChannelKey(item) {
    return __async(this, null, function* () {
      if (!item.channelKey && item.detail.dataType === "sealed" && this.seal && this.crypto) {
        try {
          const { seals } = JSON.parse(item.detail.data);
          item.channelKey = yield this.getChannelKey(seals);
        } catch (err) {
          console.log(err);
        }
      }
      return item.channelKey;
    });
  }
  unsealChannelDetail(channelId, item) {
    return __async(this, null, function* () {
      if (item.unsealedDetail == null && item.detail.dataType === "sealed" && this.seal && this.crypto) {
        try {
          const { subjectEncrypted, subjectIv, seals } = JSON.parse(item.detail.data);
          if (!item.channelKey) {
            item.channelKey = yield this.getChannelKey(seals);
            if (this.focus) {
              try {
                yield this.focus.setChannelKey(null, channelId, item.channelKey);
              } catch (err) {
                this.log.warn(err);
              }
            }
          }
          if (item.channelKey) {
            const { data } = yield this.crypto.aesDecrypt(subjectEncrypted, subjectIv, item.channelKey);
            item.unsealedDetail = data;
            if (this.focus) {
              const { dataType, enableImage, enableAudio, enableVideo, enableBinary, members, created } = item.detail;
              const focusDetail = {
                sealed: true,
                locked: false,
                dataType,
                data: this.parse(data),
                enableImage,
                enableAudio,
                enableVideo,
                enableBinary,
                created,
                members: members.map((guid) => ({ guid }))
              };
              this.focus.setDetail(null, channelId, focusDetail);
            }
            return true;
          }
        } catch (err) {
          this.log.warn(err);
        }
      }
      return false;
    });
  }
  unsealChannelSummary(channelId, item) {
    return __async(this, null, function* () {
      if (item.unsealedSummary == null && item.summary.status === "confirmed" && item.summary.dataType === "sealedtopic" && this.seal && this.crypto) {
        try {
          if (!item.channelKey) {
            const { seals } = JSON.parse(item.detail.data);
            item.channelKey = yield this.getChannelKey(seals);
            if (this.focus) {
              try {
                yield this.focus.setChannelKey(null, channelId, item.channelKey);
              } catch (err) {
                this.log.warn(err);
              }
            }
          }
          if (item.channelKey) {
            const { messageEncrypted, messageIv } = JSON.parse(item.summary.data);
            if (!messageEncrypted || !messageIv) {
              this.log.warn("invalid sealed summary");
            } else {
              const { data } = yield this.crypto.aesDecrypt(messageEncrypted, messageIv, item.channelKey);
              item.unsealedSummary = data;
              return true;
            }
          }
        } catch (err) {
          this.log.warn(err);
        }
      }
      return false;
    });
  }
};

// src/ring.ts
import { EventEmitter as EventEmitter9 } from "eventemitter3";
var EXPIRES = 6e3;
var RingModule = class {
  constructor(log, node, endContactCall) {
    this.log = log;
    this.accountNode = node;
    this.endContactCall = endContactCall;
    this.emitter = new EventEmitter9();
    this.calls = /* @__PURE__ */ new Map();
    this.closed = false;
  }
  addRingingListener(ev) {
    this.emitter.on("ringing", ev);
  }
  removeRingingListener(ev) {
    this.emitter.off("ringing", ev);
  }
  ring(call) {
    const now = (/* @__PURE__ */ new Date()).getTime();
    const { cardId, callId } = call;
    const expires = now + EXPIRES;
    const id = `${cardId}:${callId}`;
    const ringing = this.calls.get(id);
    if (ringing) {
      ringing.expires = expires;
    } else {
      this.calls.set(id, { expires, call, status: "ringing" });
    }
    this.emitRinging();
    setTimeout(() => {
      this.emitRinging();
    }, EXPIRES + 1);
  }
  emitRinging() {
    if (!this.closed) {
      const now = (/* @__PURE__ */ new Date()).getTime();
      const ringing = Array.from(this.calls.values());
      this.emitter.emit("ringing", ringing.filter((item) => item.expires > now && item.status === "ringing").map((item) => ({ cardId: item.call.cardId, callId: item.call.callId })));
    }
  }
  accept(cardId, callId, contactNode) {
    return __async(this, null, function* () {
      const now = (/* @__PURE__ */ new Date()).getTime();
      const id = `${cardId}:${callId}`;
      const entry = this.calls.get(id);
      if (!entry || entry.expires < now || entry.status !== "ringing") {
        throw new Error("invalid ringing entry");
      }
      entry.status = "accepted";
      this.emitRinging();
      const link = new LinkModule(this.log);
      const node = contactNode ? contactNode : this.accountNode;
      const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(node);
      yield link.join(node, !insecure, entry.call.calleeToken, entry.call.ice, () => __async(this, null, function* () {
        yield this.endContactCall(cardId, callId);
      }));
      return link;
    });
  }
  ignore(cardId, callId) {
    return __async(this, null, function* () {
      const now = (/* @__PURE__ */ new Date()).getTime();
      const id = `${cardId}:${callId}`;
      const entry = this.calls.get(id);
      if (!entry || entry.expires < now || entry.status !== "ringing") {
        throw new Error("invalid ringing entry");
      }
      entry.status = "ignored";
      this.emitRinging();
    });
  }
  decline(cardId, callId) {
    return __async(this, null, function* () {
      const now = (/* @__PURE__ */ new Date()).getTime();
      const id = `${cardId}:${callId}`;
      const entry = this.calls.get(id);
      if (!entry || entry.expires < now || entry.status !== "ringing") {
        throw new Error("invalid ringing entry");
      }
      entry.status = "declined";
      this.emitRinging();
      try {
        yield this.endContactCall(cardId, callId);
      } catch (err) {
        console.log(err);
      }
    });
  }
  close() {
    this.closed = true;
    this.emitter.emit("ringing", []);
  }
};

// src/connection.ts
import { EventEmitter as EventEmitter10 } from "eventemitter3";
var PING_INTERVAL = 5e3;
var Connection = class {
  constructor(log, token, node, secure) {
    this.closed = false;
    this.log = log;
    this.emitter = new EventEmitter10();
    this.websocket = this.setWebSocket(token, node, secure);
    this.stale = setInterval(() => {
      var _a, _b;
      if (((_a = this.websocket) == null ? void 0 : _a.readyState) == 1) {
        const ws = this.websocket;
        (_b = ws.ping) == null ? void 0 : _b.call(ws);
      }
    }, PING_INTERVAL);
  }
  close() {
    return __async(this, null, function* () {
      this.closed = true;
      clearInterval(this.stale);
      if (this.websocket) {
        this.websocket.close();
      }
    });
  }
  addRevisionListener(ev) {
    this.emitter.on("revision", ev);
  }
  removeRevisionListener(ev) {
    this.emitter.off("revision", ev);
  }
  addRingListener(ev) {
    this.emitter.on("call", ev);
  }
  removeRingListener(ev) {
    this.emitter.off("call", ev);
  }
  addStatusListener(ev) {
    this.emitter.on("status", ev);
  }
  removeStatusListener(ev) {
    this.emitter.off("status", ev);
  }
  setWebSocket(token, node, secure) {
    if (this.closed) {
      this.emitter.emit("status", "closed");
      return this.websocket;
    }
    this.emitter.emit("status", "connecting");
    const wsUrl = `ws${secure ? "s" : ""}://${node}/status?mode=ring`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      try {
        if (e.data === "") {
          this.emitter.emit("status", "closed");
          return;
        }
        const activity = JSON.parse(e.data);
        this.emitter.emit("status", "connected");
        if (activity.revision) {
          this.emitter.emit("revision", activity.revision);
        } else if (activity.ring) {
          const { cardId, callId, calleeToken, ice, iceUrl, iceUsername, icePassword } = activity.ring;
          const call = {
            cardId,
            callId,
            calleeToken,
            ice: ice ? ice : [
              {
                urls: iceUrl,
                username: iceUsername,
                credential: icePassword
              }
            ]
          };
          this.emitter.emit("call", call);
        } else {
          this.emitter.emit("revision", activity);
        }
      } catch (err) {
        console.log(err);
        ws.close();
      }
    };
    ws.onclose = (e) => {
      console.log(e);
      this.emitter.emit("status", "disconnected");
      setTimeout(() => {
        if (ws != null) {
          ws.onmessage = () => {
          };
          ws.onclose = () => {
          };
          ws.onopen = () => {
          };
          ws.onerror = () => {
          };
          this.websocket = this.setWebSocket(token, node, secure);
        }
      }, 1e3);
    };
    ws.onopen = () => {
      ws.send(JSON.stringify({ AppToken: token }));
    };
    ws.onerror = (e) => {
      console.log(e);
      ws.close();
    };
    return ws;
  }
};

// src/utils/syncScheduler.ts
var DEFAULT_POLL_INTERVAL = 1e3;
var MIN_POLL_INTERVAL = 100;
var MAX_POLL_INTERVAL = 1e4;
var ADAPTIVE_BACKOFF = 1.5;
var ADAPTIVE_ADVANCE = 0.8;
var SyncScheduler = class {
  constructor(log) {
    this.tasks = /* @__PURE__ */ new Map();
    this.timer = null;
    this.isRunning = false;
    this.networkStatus = "unknown";
    this.pollInterval = DEFAULT_POLL_INTERVAL;
    this.log = log;
    this.startScheduler();
  }
  registerTask(id, task, priority = 5, interval = DEFAULT_POLL_INTERVAL) {
    this.log.info(`[SyncScheduler] Registering task: ${id}`);
    this.tasks.set(id, {
      id,
      task,
      priority,
      lastRun: 0,
      interval,
      isRunning: false,
      consecutiveErrors: 0
    });
  }
  unregisterTask(id) {
    this.log.info(`[SyncScheduler] Unregistering task: ${id}`);
    this.tasks.delete(id);
  }
  triggerTask(id) {
    const entry = this.tasks.get(id);
    if (entry) {
      this.log.info(`[SyncScheduler] Manually triggering task: ${id}`);
      entry.lastRun = 0;
      this.runTask(entry);
    }
  }
  setNetworkStatus(status) {
    if (this.networkStatus !== status) {
      this.log.info(`[SyncScheduler] Network status changed: ${this.networkStatus} -> ${status}`);
      this.networkStatus = status;
      this.adjustPollInterval();
    }
  }
  startScheduler() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.runTasks();
    }, this.pollInterval);
    this.log.info(`[SyncScheduler] Scheduler started with interval: ${this.pollInterval}ms`);
  }
  runTasks() {
    return __async(this, null, function* () {
      if (this.isRunning || this.networkStatus === "offline") {
        return;
      }
      this.isRunning = true;
      const now = Date.now();
      const tasksToRun = [];
      this.tasks.forEach((entry) => {
        if (!entry.isRunning && now - entry.lastRun >= entry.interval) {
          tasksToRun.push(entry);
        }
      });
      if (tasksToRun.length === 0) {
        this.isRunning = false;
        return;
      }
      tasksToRun.sort((a, b) => a.priority - b.priority);
      this.log.debug(`[SyncScheduler] Running ${tasksToRun.length} tasks`);
      for (const entry of tasksToRun) {
        if (this.networkStatus === "offline") {
          break;
        }
        yield this.runTask(entry);
      }
      this.isRunning = false;
    });
  }
  runTask(entry) {
    return __async(this, null, function* () {
      entry.isRunning = true;
      try {
        yield entry.task();
        entry.lastRun = Date.now();
        entry.consecutiveErrors = 0;
        this.log.debug(`[SyncScheduler] Task completed: ${entry.id}`);
      } catch (err) {
        entry.consecutiveErrors++;
        this.log.error(`[SyncScheduler] Task error: ${entry.id} (${entry.consecutiveErrors} consecutive)`, err);
        if (entry.consecutiveErrors >= 3) {
          this.adjustPollInterval("backoff");
        }
      } finally {
        entry.isRunning = false;
      }
    });
  }
  adjustPollInterval(direction) {
    const oldInterval = this.pollInterval;
    if (direction === "backoff") {
      this.pollInterval = Math.min(
        this.pollInterval * ADAPTIVE_BACKOFF,
        MAX_POLL_INTERVAL
      );
      this.log.warn(
        `[SyncScheduler] Backoff: ${oldInterval}ms -> ${this.pollInterval}ms`
      );
    } else if (direction === "advance") {
      this.pollInterval = Math.max(
        this.pollInterval * ADAPTIVE_ADVANCE,
        MIN_POLL_INTERVAL
      );
      this.log.info(
        `[SyncScheduler] Advance: ${oldInterval}ms -> ${this.pollInterval}ms`
      );
    } else if (this.networkStatus === "offline") {
      this.pollInterval = MAX_POLL_INTERVAL;
      this.log.warn(`[SyncScheduler] Network offline, interval: ${this.pollInterval}ms`);
    } else if (this.networkStatus === "online") {
      this.pollInterval = DEFAULT_POLL_INTERVAL;
      this.log.info(`[SyncScheduler] Network online, interval: ${this.pollInterval}ms`);
    }
    this.restartScheduler();
  }
  restartScheduler() {
    this.startScheduler();
  }
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.log.info("[SyncScheduler] Scheduler stopped");
    }
    this.tasks.clear();
  }
  getTaskStatus(id) {
    const entry = this.tasks.get(id);
    if (!entry) {
      return null;
    }
    return {
      running: entry.isRunning,
      lastRun: entry.lastRun,
      interval: entry.interval
    };
  }
  getAllTasksStatus() {
    const tasks = [];
    this.tasks.forEach((entry) => {
      tasks.push({
        id: entry.id,
        running: entry.isRunning,
        lastRun: entry.lastRun,
        interval: entry.interval
      });
    });
    return tasks;
  }
};

// src/session.ts
var SessionModule = class {
  constructor(store, crypto, log, staging, guid, token, node, secure, loginTimestamp, channelTypes) {
    log.info("new databag session");
    this.store = store;
    this.crypto = crypto;
    this.staging = staging;
    this.log = log;
    this.guid = guid;
    this.token = token;
    this.node = node;
    this.secure = secure;
    this.channelTypes = channelTypes;
    this.loginTimestamp = loginTimestamp;
    this.status = "connecting";
    this.emitter = new EventEmitter11();
    this.identity = new IdentityModule(log, this.store, guid, token, node, secure);
    this.settings = new SettingsModule(log, this.store, this.crypto, guid, token, node, secure);
    this.contact = new ContactModule(log, this.store, this.crypto, this.staging, guid, token, node, secure, channelTypes);
    this.alias = new AliasModule(log, this.settings, this.store, guid, token, node, secure);
    this.attribute = new AttributeModule(log, this.settings, this.store, guid, token, node, secure);
    this.stream = new StreamModule(log, this.store, this.crypto, this.staging, guid, token, node, secure, channelTypes);
    this.content = new ContentModule(log, this.crypto, this.contact, this.stream);
    this.connection = new Connection(log, token, node, secure);
    this.ring = new RingModule(log, node, (cardId, callId) => __async(this, null, function* () {
      yield this.contact.endCall(cardId, callId);
    }));
    this.syncScheduler = new SyncScheduler(log);
    const onStatus = (ev) => {
      this.status = ev;
      this.emitter.emit("status", this.getStatus());
    };
    const onSeal = (seal) => {
      this.contact.setSeal(seal);
      this.stream.setSeal(seal);
    };
    const onRevision = (ev) => __async(this, null, function* () {
      yield this.identity.setRevision(ev.profile);
      yield this.settings.setRevision(ev.account);
      yield this.contact.setRevision(ev.card);
      yield this.attribute.setRevision(ev.article);
      yield this.alias.setRevision(ev.group);
      yield this.stream.setRevision(ev.channel);
    });
    const onRing = (ev) => {
      this.ring.ring(ev);
    };
    this.settings.addSealListener(onSeal);
    this.connection.addStatusListener(onStatus);
    this.connection.addRevisionListener(onRevision);
    this.connection.addRingListener(onRing);
  }
  addStatusListener(ev) {
    this.emitter.on("status", ev);
  }
  removeStatusListener(ev) {
    this.emitter.off("status", ev);
  }
  getStatus() {
    return this.status;
  }
  getParams() {
    const { node, secure, token } = this;
    return { node, secure, token };
  }
  close() {
    return __async(this, null, function* () {
      this.syncScheduler.stop();
      yield this.stream.close();
      yield this.attribute.close();
      yield this.alias.close();
      yield this.contact.close();
      yield this.identity.close();
      yield this.settings.close();
      this.connection.close();
    });
  }
  getSettings() {
    return this.settings;
  }
  getIdentity() {
    return this.identity;
  }
  getContact() {
    return this.contact;
  }
  getAlias() {
    return this.alias;
  }
  getAttribute() {
    return this.attribute;
  }
  getContent() {
    return this.content;
  }
  getRing() {
    return this.ring;
  }
  setFocus(cardId, channelId) {
    return __async(this, null, function* () {
      if (cardId) {
        return yield this.contact.setFocus(cardId, channelId);
      } else {
        return yield this.stream.setFocus(channelId);
      }
    });
  }
  clearFocus() {
    this.contact.clearFocus();
    this.stream.clearFocus();
  }
};

// src/net/getMembers.ts
function getMembers(server, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/accounts?token=${token}`;
    const accounts = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(accounts.status);
    return yield accounts.json();
  });
}

// src/net/getMemberImageUrl.ts
function getMemberImageUrl(server, secure, token, accountId, revision) {
  return `http${secure ? "s" : ""}://${server}/admin/accounts/${accountId}/image?token=${token}&revision=${revision}`;
}

// src/net/getAdminMFAuth.ts
function getAdminMFAuth(server, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/mfauth?token=${token}`;
    const mfa = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(mfa.status);
    return yield mfa.json();
  });
}

// src/net/setAdminMFAuth.ts
function setAdminMFAuth(server, secure, token, code) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/mfauth?token=${token}&code=${code}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "PUT" });
    checkResponse(status);
  });
}

// src/net/addAdminMFAuth.ts
function addAdminMFAuth(server, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/mfauth?token=${token}`;
    const mfa = yield fetchWithTimeout(endpoint, { method: "POST" });
    checkResponse(mfa.status);
    return yield mfa.json();
  });
}

// src/net/removeAdminMFAuth.ts
function removeAdminMFAuth(server, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/mfauth?token=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(status);
  });
}

// src/net/getNodeConfig.ts
function getNodeConfig(server, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/config?token=${token}`;
    const config = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(config.status);
    return yield config.json();
  });
}

// src/net/setNodeConfig.ts
function setNodeConfig(server, secure, token, config) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/config?token=${token}&setOpenAccess=true`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "PUT", body: JSON.stringify(config) });
    checkResponse(status);
  });
}

// src/net/addNodeAccount.ts
function addNodeAccount(server, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/accounts?token=${token}`;
    const create = yield fetchWithTimeout(endpoint, { method: "POST" });
    checkResponse(create.status);
    return yield create.json();
  });
}

// src/net/addNodeAccountAccess.ts
function addNodeAccountAccess(server, secure, token, accountId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/accounts/${accountId}/auth?token=${token}`;
    const access = yield fetchWithTimeout(endpoint, { method: "POST" });
    checkResponse(access.status);
    return yield access.json();
  });
}

// src/net/removeNodeAccount.ts
function removeNodeAccount(server, secure, token, accountId) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/accounts/${accountId}?token=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(status);
  });
}

// src/net/setNodeAccount.ts
function setNodeAccount(server, secure, token, accountId, disabled) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${server}/admin/accounts/${accountId}/status?token=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "PUT", body: JSON.stringify(disabled) });
    checkResponse(status);
  });
}

// src/service.ts
var ServiceModule = class {
  constructor(log, node, secure, token) {
    this.token = token;
    this.node = node;
    this.secure = secure;
    this.log = log;
  }
  createMemberAccess() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      return yield addNodeAccount(node, secure, token);
    });
  }
  resetMemberAccess(accountId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      return yield addNodeAccountAccess(node, secure, token, accountId);
    });
  }
  blockMember(accountId, flag) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setNodeAccount(node, secure, token, accountId, flag);
    });
  }
  removeMember(accountId) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield removeNodeAccount(node, secure, token, accountId);
    });
  }
  getMembers() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const accounts = yield getMembers(node, secure, token);
      return accounts.map((account) => {
        const { accountId, guid, handle, name, imageSet, revision, disabled, storageUsed } = account;
        const imageUrl = imageSet ? getMemberImageUrl(node, secure, token, accountId, revision) : avatar;
        return { accountId, guid, handle, name, imageUrl, disabled, storageUsed };
      });
    });
  }
  getSetup() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const entity = yield getNodeConfig(node, secure, token);
      const {
        domain,
        accountStorage,
        enableImage,
        enableAudio,
        enableVideo,
        enableBinary,
        keyType,
        pushSupported,
        allowUnsealed,
        transformSupported,
        enableIce,
        iceService,
        iceUrl,
        iceUsername,
        icePassword,
        enableOpenAccess,
        openAccessLimit
      } = entity;
      const service = iceService === "cloudflare" ? "cloudflare" /* Cloudflare */ : "default" /* Default */;
      const type = keyType === "RSA4096" ? "RSA4096" /* RSA_4096 */ : "RSA2048" /* RSA_2048 */;
      const setup = {
        domain,
        accountStorage,
        enableImage,
        enableAudio,
        enableVideo,
        enableBinary,
        keyType: type,
        pushSupported,
        allowUnsealed,
        transformSupported,
        enableIce,
        iceService: service,
        iceUrl,
        iceUsername,
        icePassword,
        enableOpenAccess,
        openAccessLimit
      };
      return setup;
    });
  }
  setSetup(setup) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const {
        domain,
        accountStorage,
        enableImage,
        enableAudio,
        enableVideo,
        enableBinary,
        keyType,
        pushSupported,
        allowUnsealed,
        transformSupported,
        enableIce,
        iceService,
        iceUrl,
        iceUsername,
        icePassword,
        enableOpenAccess,
        openAccessLimit
      } = setup;
      const service = iceService === "cloudflare" /* Cloudflare */ ? "cloudflare" : "";
      const type = keyType === "RSA4096" /* RSA_4096 */ ? "RSA4096" : "RSA2048";
      const entity = {
        domain,
        accountStorage,
        enableImage,
        enableAudio,
        enableVideo,
        enableBinary,
        keyType: type,
        pushSupported,
        allowUnsealed,
        transformSupported,
        enableIce,
        iceService: service,
        iceUrl,
        iceUsername,
        icePassword,
        enableOpenAccess,
        openAccessLimit
      };
      yield setNodeConfig(node, secure, token, entity);
    });
  }
  checkMFAuth() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const enabled = yield getAdminMFAuth(node, secure, token);
      return enabled;
    });
  }
  enableMFAuth() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      const { secretImage, secretText } = yield addAdminMFAuth(node, secure, token);
      return { image: secretImage, text: secretText };
    });
  }
  disableMFAuth() {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield removeAdminMFAuth(node, secure, token);
    });
  }
  confirmMFAuth(code) {
    return __async(this, null, function* () {
      const { node, secure, token } = this;
      yield setAdminMFAuth(node, secure, token, code);
    });
  }
};

// src/contributor.ts
var ContributorModule = class {
  constructor(log, crypto, node, secure, token) {
    this.log = log;
    this.crypto = crypto;
    this.node = node;
    this.secure = secure;
    this.token = token;
  }
  addTopic(type, message, assets) {
    return __async(this, null, function* () {
      return "";
    });
  }
  removeTopic(topicId) {
    return __async(this, null, function* () {
    });
  }
  addTag(topicId, type, value) {
    return __async(this, null, function* () {
      return "";
    });
  }
  removeTag(topicId, tagId) {
    return __async(this, null, function* () {
    });
  }
};

// src/logging.ts
var ConsoleLogging = class {
  error(m) {
    console.log("error:", m);
  }
  warn(m) {
    console.log("warn:", m);
  }
  info(m) {
    console.log("info:", m);
  }
};

// src/store.ts
var OfflineStore = class {
  constructor(log, sql) {
    this.sql = sql;
    this.log = log;
  }
  getTableName(table, guid) {
    if (!/^[a-zA-Z0-9_]+$/.test(guid)) {
      throw new Error("Invalid guid format");
    }
    const allowedTables = ["settings", "contact", "content", "focus", "store", "session", "channel", "card", "channel_topic", "card_channel"];
    if (!allowedTables.includes(table)) {
      throw new Error("Invalid table name");
    }
    return `${table}_${guid}`;
  }
  getValues(guid, table, fields) {
    return __async(this, null, function* () {
      return yield this.sql.get(`SELECT ${fields.join(", ")} FROM ${this.getTableName(table, guid)}`);
    });
  }
  getFilteredOrderedValues(guid, table, fields, where, order, limit) {
    return __async(this, null, function* () {
      const sort = order.map((field) => field + " DESC").join(", ");
      const condition = `${where.map(({ field }) => field + "=?").join(" AND ")}`;
      const params = where.map(({ value }) => value);
      return yield this.sql.get(`SELECT ${fields.join(", ")} FROM ${this.getTableName(table, guid)} WHERE ${condition} ORDER BY ${sort} LIMIT ${limit}`, params);
    });
  }
  getFilteredValues(guid, table, fields, where) {
    return __async(this, null, function* () {
      const condition = `${where.map(({ field }) => field + "=?").join(" AND ")}`;
      const params = where.map(({ value }) => value);
      return yield this.sql.get(`SELECT ${fields.join(", ")} FROM ${this.getTableName(table, guid)} WHERE ${condition}`, params);
    });
  }
  getFilteredOrderedOffsetValues(guid, table, fields, where, order, primaryOffset, secondaryOffset, limit) {
    return __async(this, null, function* () {
      const sort = order.map((field) => field + " DESC").join(", ");
      const condition = `${where.map(({ field }) => field + "=?").join(" AND ")} AND (${primaryOffset.field}<? OR (${primaryOffset.field}=? AND ${secondaryOffset.field}<?))`;
      const params = [...where.map(({ value }) => value), primaryOffset.value, primaryOffset.value, secondaryOffset.value];
      return yield this.sql.get(`SELECT ${fields.join(", ")} FROM ${this.getTableName(table, guid)} WHERE ${condition} ORDER BY ${sort} LIMIT ${limit}`, params);
    });
  }
  addValue(guid, table, fields, value) {
    return __async(this, null, function* () {
      return yield this.sql.set(`INSERT OR REPLACE INTO ${this.getTableName(table, guid)} (${fields.join(", ")}) VALUES (${fields.map((field) => "?").join(", ")})`, value);
    });
  }
  setValue(guid, table, idFields, fields, idValues, values) {
    return __async(this, null, function* () {
      return yield this.sql.set(`UPDATE ${this.getTableName(table, guid)} SET ${fields.map((field) => `${field}=?`).join(",")} WHERE ${idFields.map((idField) => `${idField}=?`).join(" AND ")}`, [
        ...values,
        ...idValues
      ]);
    });
  }
  removeValue(guid, table, idFields, idValues) {
    return __async(this, null, function* () {
      return yield this.sql.set(`DELETE FROM ${table}_${guid} WHERE ${idFields.map((idField) => `${idField}=?`).join(" AND ")}`, idValues);
    });
  }
  parse(value) {
    try {
      return JSON.parse(value);
    } catch (err) {
      this.log.error(err);
    }
    return {};
  }
  getAppValue(guid, id, unset) {
    return __async(this, null, function* () {
      try {
        const params = [`${guid}::${id}`];
        const rows = yield this.sql.get(`SELECT * FROM app WHERE key=?`, params);
        if (rows.length == 1 && rows[0].value != null) {
          return JSON.parse(rows[0].value);
        }
      } catch (err) {
        this.log.error(err);
      }
      return unset;
    });
  }
  setAppValue(guid, id, value) {
    return __async(this, null, function* () {
      yield this.sql.set("INSERT OR REPLACE INTO app (key, value) values (?, ?)", [`${guid}::${id}`, JSON.stringify(value)]);
    });
  }
  clearAppValue(guid, id) {
    return __async(this, null, function* () {
      yield this.sql.set("INSERT OR REPLACE INTO app (key, value) values (?, null)", [`${guid}::${id}`]);
    });
  }
  getTableValue(guid, table, field, where, unset) {
    return __async(this, null, function* () {
      try {
        const params = where.map(({ value }) => value);
        const rows = yield this.sql.get(`SELECT ${field} FROM ${table}_${guid} WHERE ${where.map((column) => column.field + "=?").join(" AND ")}`, params);
        if (rows.length == 1 && rows[0][field]) {
          return this.parse(rows[0][field]);
        }
      } catch (err) {
        this.log.error(err);
      }
      return unset;
    });
  }
  setTableValue(guid, table, record, where) {
    return __async(this, null, function* () {
      const params = [...record.map(({ value }) => JSON.stringify(value)), ...where.map(({ value }) => value)];
      yield this.sql.set(`UPDATE ${table}_${guid} SET ${record.map(({ field }) => field + "=?").join(", ")} WHERE ${where.map(({ field }) => field + "=?").join(" AND ")}`, params);
    });
  }
  clearTableValue(guid, table, field, where) {
    return __async(this, null, function* () {
      const params = where.map(({ value }) => value);
      yield this.sql.set(`UPDATE ${this.getTableName(table, guid)} SET ${field}=null WHERE ${where.map((column) => column.field + "=?" + column.value).join(" AND ")}`, params);
    });
  }
  initLogin(guid) {
    return __async(this, null, function* () {
      yield this.sql.set(
        `CREATE TABLE IF NOT EXISTS ${this.getTableName("channel", guid)} (channel_id text, detail text, unsealed_detail text, summary text, unsealed_summary text, sync text, unique(channel_id))`
      );
      yield this.sql.set(
        `CREATE TABLE IF NOT EXISTS ${this.getTableName("channel_topic", guid)} (channel_id text, topic_id text, position real, detail text, unsealed_detail text, unique(channel_id, topic_id))`
      );
      yield this.sql.set(
        `CREATE TABLE IF NOT EXISTS ${this.getTableName("card", guid)} (card_id text, revision integer, detail text, profile text, profile_revision, article_revision, channel_revision, unique(card_id))`
      );
      yield this.sql.set(
        `CREATE TABLE IF NOT EXISTS ${this.getTableName("card_channel", guid)} (card_id text, channel_id text, detail text, unsealed_detail text, summary text, unsealed_summary text, sync text, unique(card_id, channel_id))`
      );
      yield this.sql.set(
        `CREATE TABLE IF NOT EXISTS card_channel_topic_${guid} (card_id text, channel_id text, topic_id text, position real, detail text, unsealed_detail text, unique(card_id, channel_id, topic_id))`
      );
      yield this.sql.set(`CREATE TABLE IF NOT EXISTS marker_${guid} (type text, id text, value text, unique(type, id))`);
      yield this.sql.set(
        `CREATE INDEX IF NOT EXISTS card_channel_topic_sort_${guid} ON card_channel_topic_${guid} (card_id, channel_id, topic_id, position)`
      );
      yield this.sql.set(
        `CREATE INDEX IF NOT EXISTS channel_topic_sort_${guid} ON channel_topic_${guid} (channel_id, topic_id, position)`
      );
    });
  }
  init() {
    return __async(this, null, function* () {
      yield this.sql.set("CREATE TABLE IF NOT EXISTS app (key text, value text, unique(key));");
      return yield this.getAppValue("", "login", null);
    });
  }
  setMarker(guid, type, id, value) {
    return __async(this, null, function* () {
      yield this.addValue(guid, "marker", ["type", "id", "value"], [type, id, value]);
    });
  }
  clearMarker(guid, type, id) {
    return __async(this, null, function* () {
      yield this.removeValue(guid, "marker", ["type", "id"], [type, id]);
    });
  }
  getMarkers(guid, type) {
    return __async(this, null, function* () {
      const markers = yield this.getFilteredValues(guid, "marker", ["value", "id"], [{ field: "type", value: type }]);
      return markers.map((marker) => ({ id: marker.id, value: marker.value }));
    });
  }
  setLogin(login) {
    return __async(this, null, function* () {
      yield this.initLogin(login.guid);
      yield this.setAppValue("", "login", login);
    });
  }
  clearLogin() {
    return __async(this, null, function* () {
      yield this.clearAppValue("", "login");
    });
  }
  getSeal(guid) {
    return __async(this, null, function* () {
      return yield this.getAppValue(guid, "seal", null);
    });
  }
  setSeal(guid, seal) {
    return __async(this, null, function* () {
      yield this.setAppValue(guid, "seal", seal);
    });
  }
  clearSeal(guid) {
    return __async(this, null, function* () {
      yield this.clearAppValue(guid, "seal");
    });
  }
  getProfileRevision(guid) {
    return __async(this, null, function* () {
      return yield this.getAppValue(guid, "profile_revision", 0);
    });
  }
  setProfileRevision(guid, revision) {
    return __async(this, null, function* () {
      yield this.setAppValue(guid, "profile_revision", revision);
    });
  }
  getProfileData(guid) {
    return __async(this, null, function* () {
      return yield this.getAppValue(guid, "profile_data", defaultProfileEntity);
    });
  }
  setProfileData(guid, data) {
    return __async(this, null, function* () {
      yield this.setAppValue(guid, "profile_data", data);
    });
  }
  getSettingsRevision(guid) {
    return __async(this, null, function* () {
      return yield this.getAppValue(guid, "account_revision", 0);
    });
  }
  setSettingsRevision(guid, revision) {
    return __async(this, null, function* () {
      yield this.setAppValue(guid, "account_revision", revision);
    });
  }
  getSettingsData(guid) {
    return __async(this, null, function* () {
      return yield this.getAppValue(guid, "account_data", defaultConfigEntity);
    });
  }
  setSettingsData(guid, data) {
    return __async(this, null, function* () {
      yield this.setAppValue(guid, "account_data", data);
    });
  }
  getContactRevision(guid) {
    return __async(this, null, function* () {
      return yield this.getAppValue(guid, "contact_revision", 0);
    });
  }
  setContactRevision(guid, revision) {
    return __async(this, null, function* () {
      yield this.setAppValue(guid, "contact_revision", revision);
    });
  }
  getContacts(guid) {
    return __async(this, null, function* () {
      const cards = yield this.getValues(guid, "card", [
        "revision",
        "card_id",
        "profile",
        "detail",
        "profile_revision",
        "article_revision",
        "channel_revision"
      ]);
      return cards.map((card) => ({
        cardId: card.card_id,
        item: {
          revision: card.revision,
          profile: this.parse(card.profile),
          detail: this.parse(card.detail),
          profileRevision: card.profile_revision,
          articleRevision: card.article_revision,
          channelRevision: card.channel_revision
        }
      }));
    });
  }
  addContactCard(guid, cardId, item) {
    return __async(this, null, function* () {
      const fields = ["card_id", "revision", "profile", "detail", "profile_revision", "article_revision", "channel_revision"];
      const { revision, profile, detail, profileRevision, articleRevision, channelRevision } = item;
      const value = [cardId, revision, JSON.stringify(profile), JSON.stringify(detail), profileRevision, articleRevision, channelRevision];
      yield this.addValue(guid, "card", fields, value);
    });
  }
  removeContactCard(guid, cardId) {
    return __async(this, null, function* () {
      yield this.removeValue(guid, "card", ["card_id"], [cardId]);
      yield this.removeValue(guid, "card_channel", ["card_id"], [cardId]);
      yield this.removeValue(guid, "card_channel_topic", ["card_id"], [cardId]);
    });
  }
  setContactCardRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card", ["card_id"], ["revision"], [cardId], [revision]);
    });
  }
  setContactCardProfile(guid, cardId, profile) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card", ["card_id"], ["profile"], [cardId], [JSON.stringify(profile)]);
    });
  }
  setContactCardDetail(guid, cardId, detail) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card", ["card_id"], ["detail"], [cardId], [JSON.stringify(detail)]);
    });
  }
  setContactCardProfileRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card", ["card_id"], ["profile_revision"], [cardId], [revision]);
    });
  }
  setContactCardArticleRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card", ["card_id"], ["article_revision"], [cardId], [revision]);
    });
  }
  setContactCardChannelRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card", ["card_id"], ["channel_revision"], [cardId], [revision]);
    });
  }
  getContactCardChannels(guid) {
    return __async(this, null, function* () {
      const channels = yield this.getValues(guid, "card_channel", ["card_id", "channel_id", "detail", "unsealed_detail", "summary", "unsealed_summary"]);
      return channels.map((channel) => ({
        cardId: channel.card_id,
        channelId: channel.channel_id,
        item: {
          detail: this.parse(channel.detail),
          summary: this.parse(channel.summary),
          unsealedDetail: this.parse(channel.unsealed_detail),
          unsealedSummary: this.parse(channel.unsealed_summary),
          channelKey: null
        }
      }));
    });
  }
  addContactCardChannel(guid, cardId, channelId, item) {
    return __async(this, null, function* () {
      const fields = ["card_id", "channel_id", "detail", "unsealed_detail", "summary", "unsealed_summary"];
      const { detail, unsealedDetail, summary, unsealedSummary } = item;
      const value = [cardId, channelId, JSON.stringify(detail), JSON.stringify(unsealedDetail), JSON.stringify(summary), JSON.stringify(unsealedSummary)];
      yield this.addValue(guid, "card_channel", fields, value);
    });
  }
  removeContactCardChannel(guid, cardId, channelId) {
    return __async(this, null, function* () {
      yield this.removeValue(guid, "card_channel", ["card_id", "channel_id"], [cardId, channelId]);
      yield this.removeValue(guid, "card_channel_topic", ["card_id", "channel_id"], [cardId, channelId]);
    });
  }
  setContactCardChannelDetail(guid, cardId, channelId, detail, unsealedDetail) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card_channel", ["card_id", "channel_id"], ["detail", "unsealed_detail"], [cardId, channelId], [JSON.stringify(detail), JSON.stringify(unsealedDetail)]);
    });
  }
  setContactCardChannelSummary(guid, cardId, channelId, summary, unsealedSummary) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card_channel", ["card_id", "channel_id"], ["summary", "unsealed_summary"], [cardId, channelId], [JSON.stringify(summary), JSON.stringify(unsealedSummary)]);
    });
  }
  setContactCardChannelUnsealedDetail(guid, cardId, channelId, unsealedDetail) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card_channel", ["card_id", "channel_id"], ["unsealed_detail"], [cardId, channelId], [JSON.stringify(unsealedDetail)]);
    });
  }
  setContactCardChannelUnsealedSummary(guid, cardId, channelId, unsealedSummary) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card_channel", ["card_id", "channel_id"], ["unsealed_summary"], [cardId, channelId], [JSON.stringify(unsealedSummary)]);
    });
  }
  getContactCardArticles(guid) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContactCardArticle(guid, cardId, articleId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContactCardArticle(guid, cardId, articleId) {
    return __async(this, null, function* () {
    });
  }
  setContactCardArticleDetail(guid, cardId, articleId, detail, unsealedData) {
    return __async(this, null, function* () {
    });
  }
  setContactCardArticleUnsealed(guid, cardId, articleId, unsealedData) {
    return __async(this, null, function* () {
    });
  }
  getContentRevision(guid) {
    return __async(this, null, function* () {
      return yield this.getAppValue(guid, "content_revision", 0);
    });
  }
  setContentRevision(guid, revision) {
    return __async(this, null, function* () {
      yield this.setAppValue(guid, "content_revision", revision);
    });
  }
  getContentChannels(guid) {
    return __async(this, null, function* () {
      const channels = yield this.getValues(guid, "channel", ["channel_id", "detail", "unsealed_detail", "summary", "unsealed_summary"]);
      return channels.map((channel) => ({
        channelId: channel.channel_id,
        item: {
          detail: this.parse(channel.detail),
          summary: this.parse(channel.summary),
          unsealedDetail: this.parse(channel.unsealed_detail),
          unsealedSummary: this.parse(channel.unsealed_summary),
          channelKey: null
        }
      }));
    });
  }
  addContentChannel(guid, channelId, item) {
    return __async(this, null, function* () {
      const fields = ["channel_id", "detail", "unsealed_detail", "summary", "unsealed_summary"];
      const { detail, unsealedDetail, summary, unsealedSummary } = item;
      const value = [channelId, JSON.stringify(detail), JSON.stringify(unsealedDetail), JSON.stringify(summary), JSON.stringify(unsealedSummary)];
      yield this.addValue(guid, "channel", fields, value);
    });
  }
  removeContentChannel(guid, channelId) {
    return __async(this, null, function* () {
      yield this.removeValue(guid, "channel", ["channel_id"], [channelId]);
      yield this.removeValue(guid, "channel_topic", ["channel_id"], [channelId]);
    });
  }
  setContentChannelDetail(guid, channelId, detail, unsealedDetail) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "channel", ["channel_id"], ["detail", "unsealed_detail"], [channelId], [JSON.stringify(detail), JSON.stringify(unsealedDetail)]);
    });
  }
  setContentChannelSummary(guid, channelId, summary, unsealedSummary) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "channel", ["channel_id"], ["summary", "unsealed_summary"], [channelId], [JSON.stringify(summary), JSON.stringify(unsealedSummary)]);
    });
  }
  setContentChannelUnsealedDetail(guid, channelId, unsealedDetail) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "channel", ["channel_id"], ["unsealed_detail"], [channelId], [JSON.stringify(unsealedDetail)]);
    });
  }
  setContentChannelUnsealedSummary(guid, channelId, unsealedSummary) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "channel", ["channel_id"], ["unsealed_summary"], [channelId], [JSON.stringify(unsealedSummary)]);
    });
  }
  getContentChannelTopicRevision(guid, channelId) {
    return __async(this, null, function* () {
      return yield this.getTableValue(guid, "channel", "sync", [{ field: "channel_id", value: channelId }], { revision: null, marker: null });
    });
  }
  setContentChannelTopicRevision(guid, channelId, sync) {
    return __async(this, null, function* () {
      yield this.setTableValue(guid, "channel", [{ field: "sync", value: sync }], [{ field: "channel_id", value: channelId }]);
    });
  }
  getContentChannelTopics(guid, channelId, count, offset) {
    return __async(this, null, function* () {
      const fields = ["topic_id", "detail", "unsealed_detail", "position"];
      const where = [{ field: "channel_id", value: channelId }];
      const order = ["position", "topic_id"];
      const topics = offset ? yield this.getFilteredOrderedOffsetValues(guid, "channel_topic", fields, where, order, { field: "position", value: offset.position }, { field: "topic_id", value: offset.topicId }, count) : yield this.getFilteredOrderedValues(guid, "channel_topic", fields, where, order, count);
      return topics.map((topic) => ({
        topicId: topic.topic_id,
        item: {
          detail: this.parse(topic.detail),
          unsealedDetail: this.parse(topic.unsealed_detail),
          position: topic.position
        }
      }));
    });
  }
  addContentChannelTopic(guid, channelId, topicId, item) {
    return __async(this, null, function* () {
      const fields = ["channel_id", "topic_id", "detail", "unsealed_detail", "position"];
      const { detail, unsealedDetail, position } = item;
      const value = [channelId, topicId, JSON.stringify(detail), JSON.stringify(unsealedDetail), position];
      yield this.addValue(guid, "channel_topic", fields, value);
    });
  }
  removeContentChannelTopic(guid, channelId, topicId) {
    return __async(this, null, function* () {
      yield this.removeValue(guid, "channel_topic", ["channel_id", "topic_id"], [channelId, topicId]);
    });
  }
  setContentChannelTopicDetail(guid, channelId, topicId, detail, unsealedDetail, position) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "channel_topic", ["channel_id", "topic_id"], ["detail", "unsealed_detail", "position"], [channelId, topicId], [JSON.stringify(detail), JSON.stringify(unsealedDetail), position]);
    });
  }
  setContentChannelTopicUnsealedDetail(guid, channelId, topicId, unsealedDetail) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "channel_topic", ["channel_id", "topic_id"], ["unsealed_detail"], [channelId, topicId], [JSON.stringify(unsealedDetail)]);
    });
  }
  getContactCardChannelTopicRevision(guid, cardId, channelId) {
    return __async(this, null, function* () {
      return yield this.getTableValue(guid, "card_channel", "sync", [{ field: "card_id", value: cardId }, { field: "channel_id", value: channelId }], { revision: null, marker: null });
    });
  }
  setContactCardChannelTopicRevision(guid, cardId, channelId, sync) {
    return __async(this, null, function* () {
      return yield this.setTableValue(guid, "card_channel", [{ field: "sync", value: sync }], [{ field: "card_id", value: cardId }, { field: "channel_id", value: channelId }]);
    });
  }
  getContactCardChannelTopics(guid, cardId, channelId, count, offset) {
    return __async(this, null, function* () {
      const fields = ["topic_id", "detail", "unsealed_detail", "position"];
      const where = [{ field: "card_id", value: cardId }, { field: "channel_id", value: channelId }];
      const order = ["position", "topic_id"];
      const topics = offset ? yield this.getFilteredOrderedOffsetValues(guid, "card_channel_topic", fields, where, order, { field: "position", value: offset.position }, { field: "topic_id", value: offset.topicId }, count) : yield this.getFilteredOrderedValues(guid, "card_channel_topic", fields, where, order, count);
      return topics.map((topic) => ({
        topicId: topic.topic_id,
        item: {
          detail: this.parse(topic.detail),
          unsealedDetail: this.parse(topic.unsealed_detail),
          position: topic.position
        }
      }));
    });
  }
  addContactCardChannelTopic(guid, cardId, channelId, topicId, item) {
    return __async(this, null, function* () {
      const fields = ["card_id", "channel_id", "topic_id", "detail", "unsealed_detail", "position"];
      const { detail, unsealedDetail, position } = item;
      const value = [cardId, channelId, topicId, JSON.stringify(detail), JSON.stringify(unsealedDetail), position];
      yield this.addValue(guid, "card_channel_topic", fields, value);
    });
  }
  removeContactCardChannelTopic(guid, cardId, channelId, topicId) {
    return __async(this, null, function* () {
      yield this.removeValue(guid, "card_channel_topic", ["card_id", "channel_id", "topic_id"], [cardId, channelId, topicId]);
    });
  }
  setContactCardChannelTopicDetail(guid, cardId, channelId, topicId, detail, unsealedDetail, position) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card_channel_topic", ["card_id", "channel_id", "topic_id"], ["detail", "unsealed_detail", "position"], [cardId, channelId, topicId], [JSON.stringify(detail), JSON.stringify(unsealedDetail), position]);
    });
  }
  setContactCardChannelTopicUnsealedDetail(guid, cardId, channelId, topicId, unsealedDetail) {
    return __async(this, null, function* () {
      yield this.setValue(guid, "card_channel_topic", ["card_id", "channel_id", "topic_id"], ["unsealed_detail"], [cardId, channelId, topicId], [JSON.stringify(unsealedDetail)]);
    });
  }
};
var OnlineStore = class {
  constructor(log, web) {
    this.web = web;
    this.log = log;
  }
  getAppValue(guid, id, unset) {
    return __async(this, null, function* () {
      const value = yield this.web.getValue(`${guid}::${id}`);
      if (value != null) {
        return JSON.parse(value);
      }
      return unset;
    });
  }
  setAppValue(guid, id, value) {
    return __async(this, null, function* () {
      yield this.web.setValue(`${guid}::${id}`, JSON.stringify(value));
    });
  }
  clearAppValue(guid, id) {
    return __async(this, null, function* () {
      yield this.web.clearValue(`${guid}::${id}`);
    });
  }
  init() {
    return __async(this, null, function* () {
      return yield this.getAppValue("", "login", null);
    });
  }
  setMarker(guid, type, id, value) {
    return __async(this, null, function* () {
      const markers = yield this.getAppValue(guid, `marker_${type}`, []);
      try {
        const updated = markers.filter((marker) => marker.id !== id);
        updated.push({ id, value });
        this.setAppValue(guid, `marker_${type}`, updated);
      } catch (err) {
        this.log.error(err);
      }
    });
  }
  clearMarker(guid, type, id) {
    return __async(this, null, function* () {
      const markers = yield this.getAppValue(guid, `marker_${type}`, []);
      try {
        const updated = markers.filter((marker) => marker.id !== id);
        this.setAppValue(guid, `marker_${type}`, updated);
      } catch (err) {
        this.log.error(err);
      }
    });
  }
  getMarkers(guid, type) {
    return __async(this, null, function* () {
      const markers = yield this.getAppValue(guid, `marker_${type}`, []);
      try {
        return markers.map((marker) => ({ id: marker.id, value: marker.value }));
      } catch (err) {
        this.log.error(err);
        return [];
      }
    });
  }
  setLogin(login) {
    return __async(this, null, function* () {
      yield this.setAppValue("", "login", login);
    });
  }
  clearLogin() {
    return __async(this, null, function* () {
      yield this.clearAppValue("", "login");
    });
  }
  getSeal(guid) {
    return __async(this, null, function* () {
      return yield this.getAppValue(guid, "seal", null);
    });
  }
  setSeal(guid, seal) {
    return __async(this, null, function* () {
      yield this.setAppValue(guid, "seal", seal);
    });
  }
  clearSeal(guid) {
    return __async(this, null, function* () {
      yield this.clearAppValue(guid, "seal");
    });
  }
  getProfileRevision(guid) {
    return __async(this, null, function* () {
      return 0;
    });
  }
  setProfileRevision(guid, revision) {
    return __async(this, null, function* () {
    });
  }
  getProfileData(guid) {
    return __async(this, null, function* () {
      return defaultProfileEntity;
    });
  }
  setProfileData(guid, data) {
    return __async(this, null, function* () {
    });
  }
  getSettingsRevision(guid) {
    return __async(this, null, function* () {
      return 0;
    });
  }
  setSettingsRevision(guid, revision) {
    return __async(this, null, function* () {
    });
  }
  getSettingsData(guid) {
    return __async(this, null, function* () {
      return defaultConfigEntity;
    });
  }
  setSettingsData(guid, data) {
    return __async(this, null, function* () {
    });
  }
  getContactRevision(guid) {
    return __async(this, null, function* () {
      return 0;
    });
  }
  setContactRevision(guid, revision) {
    return __async(this, null, function* () {
    });
  }
  getContacts(guid) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContactCard(guid, cardId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContactCard(guid, cardId) {
    return __async(this, null, function* () {
    });
  }
  setContactCardRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
    });
  }
  setContactCardProfile(guid, cardId, profile) {
    return __async(this, null, function* () {
    });
  }
  setContactCardDetail(guid, cardId, detail) {
    return __async(this, null, function* () {
    });
  }
  setContactCardProfileRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
    });
  }
  setContactCardArticleRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
    });
  }
  getContactCardArticles(guid) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContactCardArticle(guid, cardId, articleId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContactCardArticle(guid, cardId, articleId) {
    return __async(this, null, function* () {
    });
  }
  setContactCardArticleDetail(guid, cardId, articleId, detail, unsealedData) {
    return __async(this, null, function* () {
    });
  }
  setContactCardArticleUnsealed(guid, cardId, articleId, unsealedData) {
    return __async(this, null, function* () {
    });
  }
  getContactCardChannels(guid) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContactCardChannel(guid, cardId, channelId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContactCardChannel(guid, cardId, channelId) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelDetail(guid, cardId, channelId, detail, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelSummary(guid, cardId, channelId, summary, unsealedSummary) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelUnsealedDetail(guid, cardId, channelId, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelUnsealedSummary(guid, cardId, channelId, unsealedSummary) {
    return __async(this, null, function* () {
    });
  }
  getContentRevision(guid) {
    return __async(this, null, function* () {
      return 0;
    });
  }
  setContentRevision(guid, revision) {
    return __async(this, null, function* () {
    });
  }
  addContentChannel(guid, channelId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContentChannel(guid, channelId) {
    return __async(this, null, function* () {
    });
  }
  getContentChannels(guid) {
    return __async(this, null, function* () {
      return [];
    });
  }
  setContentChannelDetail(guid, channelId, detail, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
  setContentChannelSummary(guid, channelId, summary, unsealedSummary) {
    return __async(this, null, function* () {
    });
  }
  setContentChannelUnsealedDetail(guid, channelId, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
  setContentChannelUnsealedSummary(guid, channelId, unsealedSummary) {
    return __async(this, null, function* () {
    });
  }
  getContentChannelTopicRevision(guid, channelId) {
    return __async(this, null, function* () {
      return { revision: null, marker: null };
    });
  }
  setContentChannelTopicRevision(guid, channelId, sync) {
    return __async(this, null, function* () {
    });
  }
  getContentChannelTopics(guid, channelId, count, position) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContentChannelTopic(guid, channelId, topicId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContentChannelTopic(guid, channelId, topicId) {
    return __async(this, null, function* () {
    });
  }
  setContentChannelTopicDetail(guid, channelId, topicId, detail, unsealedDetail, position) {
    return __async(this, null, function* () {
    });
  }
  setContentChannelTopicUnsealedDetail(guid, channelId, topicId, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
  getContactCardChannelTopicRevision(guid, cardId, channelId) {
    return __async(this, null, function* () {
      return { revision: null, marker: null };
    });
  }
  setContactCardChannelTopicRevision(guid, cardId, channelId, sync) {
    return __async(this, null, function* () {
    });
  }
  getContactCardChannelTopics(guid, cardId, channelId, count, position) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContactCardChannelTopic(guid, cardId, channelId, topicId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContactCardChannelTopic(guid, cardId, channelId, topicId) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelTopicDetail(guid, cardId, channelId, topicId, detail, unsealedDetail, position) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelTopicUnsealedDetail(guid, cardId, channelId, topicId, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
};
var NoStore = class {
  constructor() {
  }
  init() {
    return __async(this, null, function* () {
      return null;
    });
  }
  setMarker(guid, type, id, value) {
    return __async(this, null, function* () {
    });
  }
  clearMarker(guid, type, id) {
    return __async(this, null, function* () {
    });
  }
  getMarkers(guid, type) {
    return __async(this, null, function* () {
      return [];
    });
  }
  setLogin(login) {
    return __async(this, null, function* () {
    });
  }
  clearLogin() {
    return __async(this, null, function* () {
    });
  }
  getSeal(guid) {
    return __async(this, null, function* () {
      return null;
    });
  }
  setSeal(guid, seal) {
    return __async(this, null, function* () {
    });
  }
  clearSeal(guid) {
    return __async(this, null, function* () {
    });
  }
  getProfileRevision(guid) {
    return __async(this, null, function* () {
      return 0;
    });
  }
  setProfileRevision(guid, revision) {
    return __async(this, null, function* () {
    });
  }
  getProfileData(guid) {
    return __async(this, null, function* () {
      return defaultProfileEntity;
    });
  }
  setProfileData(guid, data) {
    return __async(this, null, function* () {
    });
  }
  getSettingsRevision(guid) {
    return __async(this, null, function* () {
      return 0;
    });
  }
  setSettingsRevision(guid, revision) {
    return __async(this, null, function* () {
    });
  }
  getSettingsData(guid) {
    return __async(this, null, function* () {
      return defaultConfigEntity;
    });
  }
  setSettingsData(guid, data) {
    return __async(this, null, function* () {
    });
  }
  getContactRevision(guid) {
    return __async(this, null, function* () {
      return 0;
    });
  }
  setContactRevision(guid, revision) {
    return __async(this, null, function* () {
    });
  }
  getContacts(guid) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContactCard(guid, cardId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContactCard(guid, cardId) {
    return __async(this, null, function* () {
    });
  }
  setContactCardRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
    });
  }
  setContactCardProfile(guid, cardId, profile) {
    return __async(this, null, function* () {
    });
  }
  setContactCardDetail(guid, cardId, detail) {
    return __async(this, null, function* () {
    });
  }
  setContactCardProfileRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
    });
  }
  setContactCardArticleRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelRevision(guid, cardId, revision) {
    return __async(this, null, function* () {
    });
  }
  getContactCardArticles(guid) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContactCardArticle(guid, cardId, articleId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContactCardArticle(guid, cardId, articleId) {
    return __async(this, null, function* () {
    });
  }
  setContactCardArticleDetail(guid, cardId, articleId, detail, unsealedData) {
    return __async(this, null, function* () {
    });
  }
  setContactCardArticleUnsealed(guid, cardId, articleId, unsealedData) {
    return __async(this, null, function* () {
    });
  }
  getContactCardChannels(guid) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContactCardChannel(guid, cardId, channelId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContactCardChannel(guid, cardId, channelId) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelDetail(guid, cardId, channelId, detail, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelSummary(guid, cardId, channelId, summary, unsealedSummary) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelUnsealedDetail(guid, cardId, channelId, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelUnsealedSummary(guid, cardId, channelId, unsealedSummary) {
    return __async(this, null, function* () {
    });
  }
  getContentRevision(guid) {
    return __async(this, null, function* () {
      return 0;
    });
  }
  setContentRevision(guid, revision) {
    return __async(this, null, function* () {
    });
  }
  addContentChannel(guid, channelId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContentChannel(guid, channelId) {
    return __async(this, null, function* () {
    });
  }
  getContentChannels(guid) {
    return __async(this, null, function* () {
      return [];
    });
  }
  setContentChannelDetail(guid, channelId, detail, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
  setContentChannelSummary(guid, channelId, summary, unsealedSummary) {
    return __async(this, null, function* () {
    });
  }
  setContentChannelUnsealedDetail(guid, channelId, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
  setContentChannelUnsealedSummary(guid, channelId, unsealedSummary) {
    return __async(this, null, function* () {
    });
  }
  getContentChannelTopicRevision(guid, channelId) {
    return __async(this, null, function* () {
      return { revision: null, marker: null };
    });
  }
  setContentChannelTopicRevision(guid, channelId, sync) {
    return __async(this, null, function* () {
    });
  }
  getContentChannelTopics(guid, channelId, count, position) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContentChannelTopic(guid, channelId, topicId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContentChannelTopic(guid, channelId, topicId) {
    return __async(this, null, function* () {
    });
  }
  setContentChannelTopicDetail(guid, channelId, topicId, detail, unsealedDetail, position) {
    return __async(this, null, function* () {
    });
  }
  setContentChannelTopicUnsealedDetail(guid, channelId, topicId, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
  getContactCardChannelTopicRevision(guid, cardId, channelId) {
    return __async(this, null, function* () {
      return { revision: null, marker: null };
    });
  }
  setContactCardChannelTopicRevision(guid, cardId, channelId, sync) {
    return __async(this, null, function* () {
    });
  }
  getContactCardChannelTopics(guid, cardId, channelId, count, position) {
    return __async(this, null, function* () {
      return [];
    });
  }
  addContactCardChannelTopic(guid, cardId, channelId, topicId, item) {
    return __async(this, null, function* () {
    });
  }
  removeContactCardChannelTopic(guid, cardId, channelId, topicId) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelTopicDetail(guid, cardId, channelId, topicId, detail, unsealedDetail, position) {
    return __async(this, null, function* () {
    });
  }
  setContactCardChannelTopicUnsealedDetail(guid, cardId, channelId, topicId, unsealedDetail) {
    return __async(this, null, function* () {
    });
  }
};

// src/net/setLogin.ts
function setLogin(node, secure, username, password, code, appName, appVersion, platform, deviceToken, pushType, notifications) {
  return __async(this, null, function* () {
    const mfa = code ? `&code=${code}` : "";
    const endpoint = `http${secure ? "s" : ""}://${node}/account/apps?appName=${appName}&appVersion=${appVersion}&platform=${platform}&deviceToken=${deviceToken}&pushType=${pushType}${mfa}`;
    const auth = encode(`${username}:${password}`);
    const headers = new Headers();
    headers.append("Authorization", "Basic " + auth);
    const login = yield fetchWithTimeout(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(notifications)
    });
    checkResponse(login.status);
    return yield login.json();
  });
}

// src/net/clearLogin.ts
function clearLogin(node, secure, token, all) {
  return __async(this, null, function* () {
    const param = all ? "&all=true" : "";
    const endpoint = `http${secure ? "s" : ""}://${node}/account/apps?agent=${token}${param}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(status);
  });
}

// src/net/removeAccount.ts
function removeAccount(node, secure, token) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/profile?agent=${token}`;
    const { status } = yield fetchWithTimeout(endpoint, { method: "DELETE" });
    checkResponse(status);
  });
}

// src/net/setAccess.ts
function setAccess(node, secure, token, appName, appVersion, platform, deviceToken, pushType, notifications) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/access?token=${token}&appName=${appName}&appVersion=${appVersion}&platform=${platform}&deviceToken=${deviceToken}&pushType=${pushType}`;
    const access = yield fetchWithTimeout(endpoint, {
      method: "PUT",
      body: JSON.stringify(notifications)
    });
    checkResponse(access.status);
    return yield access.json();
  });
}

// src/net/addAccount.ts
function addAccount(node, secure, username, password, token) {
  return __async(this, null, function* () {
    const access = token ? `?token=${token}` : "";
    const endpoint = `http${secure ? "s" : ""}://${node}/account/profile${access}`;
    const auth = encode(`${username}:${password}`);
    const headers = new Headers();
    headers.append("Authorization", `Basic ${auth}`);
    const { status } = yield fetchWithTimeout(endpoint, { method: "POST", headers }, 6e4);
    checkResponse(status);
  });
}

// src/net/setAdmin.ts
function setAdmin(node, secure, token, mfaCode) {
  return __async(this, null, function* () {
    const mfa = mfaCode ? `&code=${mfaCode}` : "";
    const endpoint = `http${secure ? "s" : ""}://${node}/admin/access?token=${encodeURIComponent(token)}${mfa}`;
    const admin = yield fetchWithTimeout(endpoint, { method: "PUT" });
    checkResponse(admin.status);
    return yield admin.json();
  });
}

// src/net/getAvailable.ts
function getAvailable(node, secure) {
  return __async(this, null, function* () {
    const endpoint = `http${secure ? "s" : ""}://${node}/account/available`;
    const available = yield fetchWithTimeout(endpoint, { method: "GET" });
    checkResponse(available.status);
    return yield available.json();
  });
}

// src/index.ts
var DatabagSDK = class {
  constructor(params, crypto, staging, log) {
    this.store = new NoStore();
    this.params = params;
    this.crypto = crypto ? crypto : null;
    this.staging = staging ? staging : null;
    this.log = log ? log : new ConsoleLogging();
    this.log.info("databag sdk");
  }
  initOfflineStore(sql) {
    return __async(this, null, function* () {
      var _a;
      const { channelTypes } = this.params;
      this.store = new OfflineStore(this.log, sql);
      yield (_a = this.staging) == null ? void 0 : _a.clear();
      const login = yield this.store.init();
      return login ? new SessionModule(this.store, this.crypto, this.log, this.staging, login.guid, login.token, login.node, login.secure, login.timestamp, channelTypes) : null;
    });
  }
  initOnlineStore(web) {
    return __async(this, null, function* () {
      const { channelTypes } = this.params;
      this.store = new OnlineStore(this.log, web);
      const login = yield this.store.init();
      return login ? new SessionModule(this.store, this.crypto, this.log, this.staging, login.guid, login.token, login.node, login.secure, login.timestamp, channelTypes) : null;
    });
  }
  available(node, secure) {
    return __async(this, null, function* () {
      return yield getAvailable(node, secure);
    });
  }
  username(name, token, node, secure) {
    return __async(this, null, function* () {
      return yield getUsername(name, token, null, node, secure);
    });
  }
  login(handle, password, node, secure, mfaCode, params) {
    return __async(this, null, function* () {
      const { channelTypes } = this.params;
      const { appName, version, deviceId, deviceToken, pushType, notifications } = params;
      const { guid, appToken, created, pushSupported } = yield setLogin(node, secure, handle, password, mfaCode, appName, version, deviceId, deviceToken, pushType, notifications);
      const login = {
        guid,
        node,
        secure,
        token: appToken,
        timestamp: created,
        pushSupported
      };
      yield this.store.setLogin(login);
      return new SessionModule(this.store, this.crypto, this.log, this.staging, guid, appToken, node, secure, created, channelTypes);
    });
  }
  access(node, secure, token, params) {
    return __async(this, null, function* () {
      const { channelTypes } = this.params;
      const { appName, version, deviceId, deviceToken, pushType, notifications } = params;
      const { guid, appToken, created, pushSupported } = yield setAccess(node, secure, token, appName, version, deviceId, deviceToken, pushType, notifications);
      const login = {
        guid,
        node,
        secure,
        token: appToken,
        timestamp: created,
        pushSupported
      };
      yield this.store.setLogin(login);
      return new SessionModule(this.store, this.crypto, this.log, this.staging, guid, appToken, node, secure, created, channelTypes);
    });
  }
  create(handle, password, node, secure, token, params) {
    return __async(this, null, function* () {
      const { channelTypes } = this.params;
      yield addAccount(node, secure, handle, password, token);
      const { appName, version, deviceId, deviceToken, pushType, notifications } = params;
      const { guid, appToken, created, pushSupported } = yield setLogin(node, secure, handle, password, null, appName, version, deviceId, deviceToken, pushType, notifications);
      const login = {
        guid,
        node,
        secure,
        token: appToken,
        timestamp: created,
        pushSupported
      };
      yield this.store.setLogin(login);
      return new SessionModule(this.store, this.crypto, this.log, this.staging, guid, appToken, node, secure, created, channelTypes);
    });
  }
  remove(session) {
    return __async(this, null, function* () {
      const sessionModule = session;
      const { node, secure, token } = sessionModule.getParams();
      yield removeAccount(node, secure, token);
      yield sessionModule.close();
      try {
        yield this.store.clearLogin();
      } catch (err) {
        this.log.error(err);
      }
    });
  }
  logout(session, all) {
    return __async(this, null, function* () {
      const sessionModule = session;
      const { node, secure, token } = sessionModule.getParams();
      yield sessionModule.close();
      try {
        yield this.store.clearLogin();
      } catch (err) {
        this.log.error(err);
      }
      clearLogin(node, secure, token, all).then(() => {
      }).catch((err) => {
        console.log(err);
      });
    });
  }
  configure(node, secure, token, mfaCode) {
    return __async(this, null, function* () {
      const access = yield setAdmin(node, secure, token, mfaCode);
      return new ServiceModule(this.log, node, secure, access);
    });
  }
  automate(node, secure, token) {
    return __async(this, null, function* () {
      return new ContributorModule(this.log, this.crypto, node, secure, token);
    });
  }
};
export {
  AssetType,
  DatabagSDK,
  HostingMode,
  ICEService,
  KeyType,
  PushType,
  TransformType
};
//# sourceMappingURL=index.mjs.map