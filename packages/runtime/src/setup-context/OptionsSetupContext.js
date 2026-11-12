/** 注册阶段的声明收集器：生成原生配置、数据快照与实例转发入口。 */
import { isSignal, interpretSignal } from '@reactive-mp/reactivity';
import {
  isFunction,
  isNonEmptyArray,
  isNonEmptyObject,
  isNonEmptyString,
  mergeArrayOrderByExists,
  mergeArrayOrderByNewCome,
} from '@reactive-mp/shared';
import {
  componentMountLifetimeNames,
  componentPageLifetimeNames,
} from '../etc/constants.js';
import { formatObserveSource } from '../etc/formatters.js';
import {
  createExportHandleCallingForwarder,
  createMethodInvokationForwarder,
  createDataChangeEventForwarder,
  createPropSyncingForwarder,
  createRelationEventForwarder,
} from './calling-forwarding.js';
import SetupContext from './SetupContext.js';
import { snapshotViewData } from '../etc/data-binding.js';

export default class extends SetupContext {
  defineOptions(options) {
    super.defineOptions(options);
    this.setupRecords.options = {
      ...this.setupRecords.options,
      ...options,
    };
  }
  mixInBehaviors(behaviors, ...more) {
    behaviors = [behaviors, ...more].flat();
    super.mixInBehaviors(behaviors);
    this.setupRecords.behaviorRefs = mergeArrayOrderByNewCome(
      this.setupRecords.behaviorRefs,
      behaviors,
      () => true,
    );
  }

  addExternalClasses(attrs, ...more) {
    attrs = [attrs, ...more].flat();
    super.addExternalClasses(attrs);
    this.setupRecords.extClasses = mergeArrayOrderByExists(
      this.setupRecords.extClasses,
      attrs,
      isNonEmptyString,
    );
  }
  defineProperties(definations = {}) {
    return Object.freeze({ ...super.defineProperties(definations) });
  }
  addMixedObserver(scope, src, callback) {
    super.addMixedObserver(scope, src, callback);
    if (isFunction(callback)) {
      const { observers } = this.setupRecords;
      const { key } = formatObserveSource(src, scope);
      if (key) {
        observers[key] = observers[key] || [];
      }
    }
    return () => false;
  }

  markPageComponent(setupReturns) {
    super.markPageComponent(setupReturns);
    return setupReturns;
  }

  formatCommonOptions(options) {
    const { options: optOptions, behaviors, ...formattedOptions } = options;
    const { options: setupOptions, behaviorRefs } = this.setupRecords;
    if (isNonEmptyObject(setupOptions)) {
      formattedOptions.options = { ...optOptions, ...setupOptions };
    } else if (isNonEmptyObject(optOptions)) {
      formattedOptions.options = optOptions;
    }
    if (isNonEmptyArray(behaviorRefs)) {
      formattedOptions.behaviors = mergeArrayOrderByNewCome(
        behaviors,
        behaviorRefs,
        () => true,
      );
    } else if (isNonEmptyArray(behaviors)) {
      formattedOptions.behaviors = behaviors;
    } else {
      formattedOptions.behaviors = [];
    }
    return formattedOptions;
  }
  formatOptions(options) {
    this.assertIsActive('format options');
    const { externalClasses, export: optExport, ...formattedOptions } = options;
    const { relations, behaviorRefs, extClasses, exports } = this.setupRecords;
    if (this.isComponent) {
      if (relations.size) {
        formattedOptions.relations = { ...options.relations };
        Array.from(relations).forEach(([id, desc]) => {
          const { handler, ...relation } = desc;
          for (const [eventName, handle] of Object.entries(handler)) {
            if (isFunction(handle)) {
              relation[eventName] = createRelationEventForwarder(
                this.runtimeContext,
                id,
                eventName,
                this.isPage,
              );
            }
          }
          formattedOptions.relations[id] = relation;
        });
      }
      if (isNonEmptyArray(extClasses)) {
        formattedOptions.externalClasses = mergeArrayOrderByExists(
          externalClasses,
          extClasses,
          isNonEmptyString,
        );
      } else if (isNonEmptyArray(externalClasses)) {
        formattedOptions.externalClasses = externalClasses;
      }
      if (exports) {
        // 添加必要的行为 wx://component-export
        behaviorRefs.push('wx://component-export');
        formattedOptions.export = createExportHandleCallingForwarder(
          this.runtimeContext,
        );
      } else if (isFunction(optExport)) {
        behaviorRefs.push('wx://component-export');
        formattedOptions.export = optExport;
      }
    }
    return this.formatCommonOptions(formattedOptions);
  }
  createPropertiesOption(options) {
    const { option } = this.setupRecords.props;
    return { ...options.properties, ...option };
  }
  formatDataAndMethods(optData, optMethod) {
    const { runtimeContext, isPage } = this;
    const data = { ...optData };
    const methods = { ...optMethod };
    Object.entries(this.setupReturns).forEach(([name, item]) => {
      if (isFunction(item)) {
        if (isSignal(item, true)) {
          data[name] = item();
        } else {
          methods[name] = createMethodInvokationForwarder(
            runtimeContext,
            name,
            isPage,
          );
        }
      } else if (isSignal(item)) {
        data[name] = interpretSignal(item, true);
      } else {
        data[name] = item;
      }
    });
    const pattern =
      this.setupRecords.options?.pureDataPattern ??
      this.nativeOptions?.pureDataPattern;
    const viewData = Object.fromEntries(
      Object.entries(data)
        .filter(([name]) => {
          if (!(pattern instanceof RegExp)) {
            return true;
          }
          pattern.lastIndex = 0;
          return !pattern.test(name);
        })
        .map(([name, value]) => [name, snapshotViewData(value)]),
    );
    return { data: viewData, methods };
  }
  createLifetimeOptions(options) {
    const { runtimeContext, setupLifetimes } = this;
    const lifetimes = { ...options.lifetimes };
    const pageLifetimes = { ...options.pageLifetimes };
    setupLifetimes.forEach((lifetime) => {
      if (
        componentMountLifetimeNames.includes(lifetime) ||
        lifetime === 'created'
      ) {
        return;
      }
      function lifetimehandle(...args) {
        runtimeContext
          .getComponentScope(this)
          ?.forwardInstanceLifetimeEvent(lifetime, ...args);
      }
      if (componentPageLifetimeNames.includes(lifetime)) {
        pageLifetimes[lifetime] = lifetimehandle;
      } else {
        lifetimes[lifetime] = lifetimehandle;
      }
    });
    // this.setupLifetimes = [];
    return { lifetimes, pageLifetimes };
  }
  createObserversOption(optObservers = {}) {
    const { runtimeContext, isPage, setupRecords } = this;
    const { observers: setupObservers, props } = setupRecords;
    const observers = { ...optObservers };
    Object.keys(setupObservers).forEach((src) => {
      observers[src] = createDataChangeEventForwarder(
        runtimeContext,
        src,
        isPage,
        observers[src],
      );
    });
    if (this.isComponent && props.names?.length) {
      const propsWatcherSource = props.names.join(',');
      const sameSourceCallback = observers[propsWatcherSource];
      observers[propsWatcherSource] = createPropSyncingForwarder(
        runtimeContext,
        props.names,
        sameSourceCallback,
      );
    }
    // this.setupRecords.observers = {};
    return observers;
  }
}
