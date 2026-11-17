/** 真实微信模拟器验证字段关系、提交、Hooks、自定义字段与多表单隔离。 */
import assert from 'node:assert/strict';
import { runWechatVerification } from './lib/wechat-verification.mjs';
await runWechatVerification(
  { output: 'artifacts/form-live-verification.json', timeout: 45000 },
  async (app, report) => {
    for (const route of ['form-native', 'form-reactive']) {
      const page = await app.reLaunch('/pages/' + route + '/index');
      const form = await page.$('#form');
      assert.ok(form, 'form did not mount');
      const initial = await form.callMethod('submit');
      const field = await page.$('#name-field');
      assert.ok(field, 'input field did not mount');
      const input = await field.$('input');
      assert.ok(input, 'native input did not render');
      await input.input('示例名称');
      await form.callMethod('setFieldValue', 'accepted', true);
      const submitted = await form.callMethod('submit');
      const values = await form.callMethod('getValues');
      assert.equal(initial.status, 'invalid');
      assert.equal(submitted.status, 'submitted');
      assert.equal(values.name, '示例名称');
      const result = {
        initial: initial.status,
        submitted: submitted.status,
        values,
        rendered: await field.data('fieldValue'),
      };
      assert.equal(result.rendered, '示例名称');
      report.checks.push({ scene: route, result });
    }
    const hooks = await app.reLaunch('/pages/form-hooks/index');
    await hooks.callMethod('onPasswordInput', { detail: { value: 'abc' } });
    await hooks.callMethod('onConfirmationInput', { detail: { value: 'abc' } });
    await hooks.callMethod('submit');
    assert.ok((await hooks.data('result')).includes('abc'));
    report.checks.push({ scene: 'native-input-hooks', passed: true });
    const page = await app.reLaunch('/pages/form-fields/index');
    const main = await page.$('#main');
    const other = await page.$('#secondary');
    const values = await main.callMethod('getValues');
    await other.callMethod('setFieldValue', 'other', '独立');
    const fields = {
      values,
      main: await main.callMethod('getValues'),
      other: await other.callMethod('getValues'),
    };
    assert.deepEqual(fields.values.point, { x: 0, y: 0 });
    assert.equal(fields.main.other, undefined);
    assert.equal(fields.other.other, '独立');
    report.checks.push({
      scene: 'compound-field-and-form-isolation',
      result: fields,
    });
    if (process.argv.includes('--screenshot')) {
      await app.screenshot({ path: 'artifacts/form-live.png' });
    }
  },
);
