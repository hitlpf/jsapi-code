// 获取jsapi iOS和Android对应的版本

const fs = require('fs'); 
const path = require('path');
const axios = require('axios');
const shell = require('shelljs');
const { groupBy } = require('lodash');

const args = process.argv.slice(2);
console.log(args);

// curversion是否小于等于baseversion
function comparePpnvLt(curversion: any, baseversion: any) {
  const curArr = curversion?.split?.('.') || [];
  const baseArr = baseversion?.split?.('.') || [];
  const length = Math.max(curArr.length, baseArr.length);
  for (let i = 0; i < length; i++) {
    if (Number(curArr[i]) === Number(baseArr[i])) {
      continue;
    }
    return Number(curArr[i] || 0) <= Number(baseArr[i] || 0);
  };
  return true;
}

function sortFun(lines: any) {
  const lineList = lines.map((line: any) => {
    return line.split('\t');
  });

  lineList.sort((a: any, b: any) => {
    return comparePpnvLt(a[2], b[2]) ? 1 : -1;
  });
  return lineList;
}

const request = (method: any, url: any) => {
  return axios({ method, url });
}

export default async function (ctx: any) {
  // const jsapiUsed = fs.readFileSync(path.resolve(__dirname, '../../src/data/jsapiListNew.txt'), "utf-8").split('\n');
  const { key } = ctx.query;
  const jsapiUsed = key?.split(',');
  const jsapiSplit = jsapiUsed.map((jsapi: any) => jsapi.split('.'));
  // 在使用的jsapi的分组
  const jsapiGroups = [...new Set(jsapiSplit.map((jsapisplit: any) => jsapisplit[0]))];
  // 通过接口拉取所有的jsapi的版本映射关系和define code
  let unauthListJson = {};
  try {
    unauthListJson = await request('GET', 'http://exp.qbjsapi.oa.com/unauth/api/list');
  } catch (error) {
    console.log(error);
  }
  
  // const jsapiJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, './unauth_list.json'), "utf-8"));
  const jsapiJson = unauthListJson.data;
  // 先过滤出在使用的group
  const jsapiAllGroups = jsapiJson.data.filter((group: any) => jsapiGroups.includes(group.groupName));
  let allapi = jsapiAllGroups.map((jsapiObj: any) => {
    return jsapiObj.list.map((child: any) => {
      const apiName = `${jsapiObj.groupName}.${child.name}`;
      // api没在使用直接结束
      if (!jsapiUsed.includes(apiName)) return;

      if (apiName === 'env.qua2') {
        console.log(apiName);
      }

      let plans = child.plan.map((plan: any) => plan.support);
      plans = plans.flat(Infinity);
      // ppvn按照ios和android分组
      const ppvns = groupBy(plans, (plan: any) => {
        return plan.platform === 1 ? 'ios' : 'android';
      });
      // 每个平台可能多个版本，从大到小排序后取第一个
      Object.keys(ppvns).forEach(platform => {
        ppvns[platform].sort((a: any, b: any) => {
          // return comparePpnv(b.number, a.number) ? 1 : -1;
          return !comparePpnvLt(b.number, a.number) ? 1 : -1;
        });
        ppvns[platform] = ppvns[platform][0];
      });

      // code按照ios和android分组
      let codes: any = {};
      try {
        let lastChange = child.changeList.map((change: any) => change.plan)?.[0];
        codes = groupBy(lastChange, (plan: any) => {
          let support = plan.support?.[0];
          return support.platform === 1 ? 'ios' : 'android';
        });
        Object.keys(codes).forEach((key: any) => {
          codes[key] = codes[key][0].code?.replace(/\n/g, '').replace(/\s/g, '');
        });
      } catch (error) {}

      return { apiName, ppvn: ppvns, codes }
    });
  });

  const lines: any = [];
  allapi = allapi.flat(Infinity).filter(Boolean).forEach((jsapi: any) => {
    const iosPpvn = jsapi.ppvn['ios']?.number ? `${jsapi.ppvn['ios']?.number}` : '';
    const iosCode = jsapi.codes['ios'] ? `${jsapi.codes['ios']}` : '';
    if (iosCode) {
      lines.push(`iOS\t${jsapi.apiName}\t${iosPpvn}\t${iosCode}`);
    }
    const androidPpvn = jsapi.ppvn['android']?.number ? `${jsapi.ppvn['android']?.number}` : '';
    const androidCode = jsapi.codes['android'] ? `${jsapi.codes['android']}` : '';
    if (androidCode) {
      lines.push(`android\t${jsapi.apiName}\t${androidPpvn}\t${androidCode}`);
    }
    console.log(`iOS\t${jsapi.apiName}\t${iosPpvn}\t${iosCode}`);
    console.log(`android\t${jsapi.apiName}\t${androidPpvn}\t${androidCode}`);
  });

  fs.writeFileSync(path.resolve(__dirname, '../../src/data/jsapiDefineMap.txt'), lines.join('\n'));


  // 重新排序
  let jsapiLinesCurrent = fs.readFileSync(path.resolve(__dirname, '../../src/data/jsapi_ppvn_define_map.txt'), "utf-8").split('\n');
  let jsapiLinesNew = fs.readFileSync(path.resolve(__dirname, '../../src/data/jsapiDefineMap.txt'), "utf-8").split('\n');
  
  let linesIOS: any = [];
  let linesAndroid: any = [];
  [...new Set([...jsapiLinesCurrent, ...jsapiLinesNew])].forEach(jsapi => {
    if (jsapi.startsWith('iOS')) {
      linesIOS.push(jsapi);
    } else {
      linesAndroid.push(jsapi);
    }
  });
  
  linesIOS = sortFun(linesIOS).map((line: any) => line.join('\t'));;
  linesAndroid = sortFun(linesAndroid).map((line: any) => line.join('\t'));;
  
  fs.writeFileSync(path.resolve(__dirname, '../../src/data/jsapi_ppvn_define_map.txt'), [...linesIOS, ...linesAndroid].join('\n'));

  shell.exec(`rsync -avz ${path.resolve(__dirname, '../../src/data/jsapi_ppvn_define_map.txt')} /search/odin/daemon/wap_server/`);

  return 'jsapi文件生成成功, 并已经同步至ot环境';
}
