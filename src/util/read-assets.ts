import fs from 'fs';

/** myMethod的方法装饰器，是原始方法执行前后各打印一段日志
 * @param target 是类的原型
 * @param propertyKey 是方法名
 * @param descriptor 是方法的属性描述符
 */
function methodDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`----开始读取js资源 ${propertyKey}`);
    const result = originalMethod.apply(this, args);
    console.log(`----结束读取js资源 ${propertyKey}`);
    return result;
  };
  return descriptor;
}

class Assets {
  readonly filename: string = 'dist/client/assets.json';

  public getAssetsJsonFile() {
    return fs.readFileSync(this.filename, 'utf-8');
  }

  @methodDecorator
  public getAssets() {
    const assetsJsonFile = this.getAssetsJsonFile();
    const assetsJson = JSON.parse(assetsJsonFile);
    const {
      manifest: { js: manifestJs },
      main: { js: mainJs, css: mainCss },
      vendor_react: { js: vendorReactJs },
      vendor_common: { js: vendorCommonJs },
    } = assetsJson;

    return { manifestJs, mainJs, vendorReactJs, vendorCommonJs, mainCss };
  }
}

export default new Assets();
